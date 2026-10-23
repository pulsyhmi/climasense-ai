import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  buildGeminiSystemInstruction,
  buildGeminiUserPrompt,
  parseGeminiResponse,
  ClimateContextPayload,
} from './src/utils/geminiPrompt.ts';
import {
  callGeminiWithFallbackAndRetry,
  isRetryableError,
} from './src/utils/geminiChatService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'ClimaSense AI Server',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      primaryModel: 'gemini-3.5-flash-lite',
      fallbackModel: 'gemini-3.1-flash-lite',
      timestamp: new Date().toISOString(),
    });
  });

  // Secure Server-Side Gemini API Chat Route with Bounded Backoff and Fallback
  app.post('/api/assistant/chat', async (req: Request, res: Response): Promise<void> => {
    const { message, conversationHistory = [], climateContext } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.warn('[Gemini API] Server key missing or placeholder.');
      res.status(503).json({
        error: 'Our AI assistant is temporarily unavailable. Please try again shortly.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = buildGeminiSystemInstruction();

      // Format user prompt with all real observations, timestamps, and indicative risks
      let userPrompt = message;
      if (climateContext) {
        userPrompt = buildGeminiUserPrompt(message, climateContext as ClimateContextPayload);
      }

      // Sanitize and alternate conversation history into valid Gemini contents format
      const validHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(conversationHistory)) {
        for (const item of conversationHistory.slice(-6)) {
          if (!item || !item.text || !item.sender) continue;
          // Skip if user text is identical to current user message (e.g. from retries)
          if (item.sender === 'user' && item.text.trim() === message.trim()) continue;
          // Skip initial bot welcome greeting
          if (item.sender === 'assistant' && (item.id === 'msg-welcome' || item.text.includes('ClimaSense AI Assistant'))) continue;

          const role = item.sender === 'user' ? 'user' : 'model';

          // Ensure proper alternating roles
          if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === role) {
            validHistory[validHistory.length - 1].parts[0].text += `\n\n${item.text}`;
          } else {
            validHistory.push({
              role,
              parts: [{ text: item.text }],
            });
          }
        }
      }

      // Ensure history starts with user role if non-empty
      while (validHistory.length > 0 && validHistory[0].role !== 'user') {
        validHistory.shift();
      }

      // Append current user prompt
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
        ...validHistory,
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ];

      // Execute with bounded exponential backoff on primary (gemini-3.5-flash-lite)
      // and automatic fallback to verified gemini-3.1-flash-lite if primary is overloaded (503)
      const result = await callGeminiWithFallbackAndRetry({
        ai,
        contents,
        systemInstruction,
        temperature: 0.25,
        primaryModel: 'gemini-3.5-flash-lite',
        fallbackModel: 'gemini-3.1-flash-lite',
        maxPrimaryRetries: 1,
        maxFallbackRetries: 1,
        timeoutMs: 9000,
      });

      const { cleanText, suggestedActions } = parseGeminiResponse(result.text || '');

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-MY', {
        hour: '2-digit',
        minute: '2-digit',
      });

      res.json({
        text: cleanText,
        suggestedActions,
        model: result.model,
        usedFallback: result.usedFallback,
        retriesUsed: result.retriesUsed,
        timestamp: timeStr,
      });
    } catch (err: unknown) {
      // Keep technical details only in server-side logs!
      console.error('[Server-Side Gemini Generation Error Details]:', err);

      const retryable = isRetryableError(err);
      const isOverloadOrQuota =
        retryable ||
        JSON.stringify(err).toLowerCase().includes('quota') ||
        JSON.stringify(err).toLowerCase().includes('unavailable') ||
        JSON.stringify(err).toLowerCase().includes('resource_exhausted');

      const friendlyMessage = isOverloadOrQuota
        ? 'Our AI assistant is temporarily unavailable. Please try again shortly.'
        : 'Our AI assistant encountered an issue with this request. Please try rephrasing.';

      const statusCode = isOverloadOrQuota ? 503 : 400;

      res.status(statusCode).json({
        error: friendlyMessage,
        retryable,
      });
    }
  });

  // Mount Vite middleware in development, or serve static dist in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClimaSense AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
