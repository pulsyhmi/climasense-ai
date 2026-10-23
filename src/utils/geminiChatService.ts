import { GoogleGenAI } from '@google/genai';

export interface ChatServiceOptions {
  ai: GoogleGenAI;
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  systemInstruction: string;
  temperature?: number;
  primaryModel?: string;
  fallbackModel?: string;
  maxPrimaryRetries?: number;
  maxFallbackRetries?: number;
  timeoutMs?: number;
  sleepFn?: (ms: number) => Promise<void>;
  logger?: {
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };
}

export interface ChatServiceResult {
  text: string;
  model: string;
  retriesUsed: number;
  usedFallback: boolean;
}

/**
 * Checks whether an error is transient/retryable (503, 502, 504, 429, etc.)
 * or permanent (400, 401, 403, 404, etc.)
 */
/**
 * Checks whether an error is globally fatal across all models (e.g. invalid API key, unauthenticated, permission denied)
 */
export function isGlobalFatalError(err: unknown): boolean {
  if (!err) return false;
  const errorObj = err as Record<string, unknown>;
  const status = Number(errorObj.status || (errorObj.response as Record<string, unknown>)?.status || 0);

  if (status === 401 || status === 403) return true;

  const message = typeof errorObj.message === 'string' ? errorObj.message.toLowerCase() : '';
  const errorStr = JSON.stringify(err).toLowerCase();

  return (
    message.includes('api_key_invalid') ||
    message.includes('unauthenticated') ||
    message.includes('permission_denied') ||
    errorStr.includes('api_key_invalid') ||
    errorStr.includes('permission_denied')
  );
}

/**
 * Checks whether an error is transient/retryable on the SAME model (503, 502, 504, short-term rate limit, timeouts)
 */
export function isRetryableError(err: unknown): boolean {
  if (!err) return false;
  if (isGlobalFatalError(err)) return false;

  const errorObj = err as Record<string, unknown>;
  const status = Number(errorObj.status || (errorObj.response as Record<string, unknown>)?.status || 0);

  // Non-retryable HTTP status codes
  if (status === 400 || status === 401 || status === 403 || status === 404) {
    return false;
  }

  const message = typeof errorObj.message === 'string' ? errorObj.message.toLowerCase() : '';
  const errorStr = JSON.stringify(err).toLowerCase();

  // If daily quota is exhausted (many hours delay), it cannot be resolved with short backoff
  if (
    errorStr.includes('generaterequestsperday') ||
    errorStr.includes('free_tier_requests') ||
    errorStr.includes('exceeded your current quota')
  ) {
    return false;
  }

  // Explicit retryable HTTP status codes
  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }

  // Retryable keywords
  if (
    message.includes('503') ||
    message.includes('unavailable') ||
    message.includes('overloaded') ||
    message.includes('high demand') ||
    message.includes('resource_exhausted') ||
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('502') ||
    message.includes('504') ||
    message.includes('gateway timeout') ||
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('fetch failed') ||
    errorStr.includes('unavailable') ||
    errorStr.includes('503') ||
    errorStr.includes('overloaded')
  ) {
    return true;
  }

  return false;
}

/**
 * Extracts Retry-After duration in milliseconds if provided by the error headers or body.
 * Clamped between 100ms and 5000ms. If greater than 60s (daily reset), returns null.
 */
export function extractRetryAfterMs(err: unknown): number | null {
  if (!err || typeof err !== 'object') return null;

  const errorObj = err as Record<string, unknown>;
  const headers = (errorObj.headers || (errorObj.response as Record<string, unknown>)?.headers) as
    | Record<string, string>
    | undefined;

  let rawHeader: string | undefined;
  if (headers) {
    if (typeof headers.get === 'function') {
      rawHeader = (headers as unknown as { get: (k: string) => string }).get('retry-after');
    } else {
      rawHeader = headers['retry-after'] || headers['Retry-After'];
    }
  }

  if (!rawHeader && typeof errorObj.message === 'string') {
    const match = errorObj.message.match(/retry[- ]after[:\s]+(\d+)/i);
    if (match) rawHeader = match[1];
  }

  if (rawHeader) {
    const seconds = Number(rawHeader);
    if (!isNaN(seconds) && seconds > 0) {
      if (seconds > 60) return null;
      return Math.min(seconds * 1000, 5000);
    }
  }

  return null;
}

/**
 * Calculates exponential backoff with random jitter.
 */
export function calculateBackoffWithJitter(
  attempt: number,
  baseDelay = 600,
  maxDelay = 3000,
  jitterMax = 250
): number {
  const exponential = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * jitterMax;
  return Math.min(exponential + jitter, maxDelay);
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Orchestrates calls to Gemini with primary model, bounded exponential backoff with jitter,
 * and seamless fallback to secondary model on 503 / high demand.
 */
export async function callGeminiWithFallbackAndRetry(
  options: ChatServiceOptions
): Promise<ChatServiceResult> {
  const {
    ai,
    contents,
    systemInstruction,
    temperature = 0.25,
    primaryModel = 'gemini-3.5-flash-lite',
    fallbackModel = 'gemini-3.1-flash-lite',
    maxPrimaryRetries = 1,
    maxFallbackRetries = 1,
    timeoutMs = 9000,
    sleepFn = defaultSleep,
    logger = console,
  } = options;

  let totalRetries = 0;
  let lastError: unknown = null;

  // Helper to execute a single generateContent with timeout
  const executeCall = async (model: string): Promise<string> => {
    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Gemini request timeout after ${timeoutMs}ms for model ${model}`));
      }, timeoutMs);
    });

    try {
      const callPromise = ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature,
        },
      });

      const response = await Promise.race([callPromise, timeoutPromise]);
      return response.text || '';
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  // 1. Attempt Primary Model (gemini-3.8-flash)
  for (let attempt = 0; attempt <= maxPrimaryRetries; attempt++) {
    try {
      if (attempt > 0) {
        logger.info(`[Gemini API] Retry attempt ${attempt}/${maxPrimaryRetries} on primary model: ${primaryModel}`);
      }

      const text = await executeCall(primaryModel);
      return {
        text,
        model: primaryModel,
        retriesUsed: totalRetries,
        usedFallback: false,
      };
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);

      logger.warn(
        `[Gemini API] Primary model ${primaryModel} failed on attempt ${attempt + 1}: ${errMsg}`
      );

      // If error is globally fatal across all models (e.g. invalid API key), halt immediately
      if (isGlobalFatalError(err)) {
        logger.error(`[Gemini API] Global non-retryable error on ${primaryModel}. Halting immediately.`);
        throw err;
      }

      const retryable = isRetryableError(err);

      // If we still have primary retries left and error is transient (e.g. 503 high demand), back off and retry
      if (retryable && attempt < maxPrimaryRetries) {
        totalRetries++;
        const retryAfter = extractRetryAfterMs(err);
        const delay = retryAfter !== null ? retryAfter : calculateBackoffWithJitter(attempt);
        logger.info(`[Gemini API] Backing off for ${Math.round(delay)}ms before retry...`);
        await sleepFn(delay);
        continue;
      }

      // If non-retryable on primary (like quota) or retries exhausted, proceed to fallback model
      break;
    }
  }

  // 2. Primary model unavailable (503 high demand or capacity).
  // Switch to verified fallback model (gemini-3.6-flash).
  logger.warn(
    `[Gemini API] Primary model ${primaryModel} unavailable. Switching to fallback model: ${fallbackModel}`
  );

  for (let attempt = 0; attempt <= maxFallbackRetries; attempt++) {
    try {
      if (attempt > 0) {
        logger.info(`[Gemini API] Retry attempt ${attempt}/${maxFallbackRetries} on fallback model: ${fallbackModel}`);
      }

      const text = await executeCall(fallbackModel);
      logger.info(`[Gemini API] Fallback model ${fallbackModel} succeeded.`);
      return {
        text,
        model: fallbackModel,
        retriesUsed: totalRetries,
        usedFallback: true,
      };
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);

      logger.warn(
        `[Gemini API] Fallback model ${fallbackModel} failed on attempt ${attempt + 1}: ${errMsg}`
      );

      if (isGlobalFatalError(err)) {
        logger.error(`[Gemini API] Global non-retryable error on fallback ${fallbackModel}. Halting.`);
        throw err;
      }

      const retryable = isRetryableError(err);
      if (retryable && attempt < maxFallbackRetries) {
        totalRetries++;
        const retryAfter = extractRetryAfterMs(err);
        const delay = retryAfter !== null ? retryAfter : calculateBackoffWithJitter(attempt);
        await sleepFn(delay);
        continue;
      }

      break;
    }
  }

  // Both primary and fallback failed
  logger.error('[Gemini API] Both primary and fallback models exhausted. Throwing final error.');
  throw lastError || new Error('All Gemini models currently unavailable.');
}
