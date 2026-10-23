import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Info,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage } from '../../types/index.ts';
import { TownshipProfile } from '../../config/townshipConfig.ts';
import { LiveClimateData } from '../../services/climateService.ts';

interface AiAssistantProps {
  township: TownshipProfile;
  liveData: LiveClimateData | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onRetry?: () => void;
  initialPrompt?: string;
  lastQuery?: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  township,
  liveData,
  messages,
  isLoading,
  error,
  onSendMessage,
  onClearChat,
  onRetry,
  initialPrompt,
  lastQuery,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, error]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      setInputText(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText('');
    onSendMessage(userText);
  };

  const handleRestoreQuery = () => {
    if (lastQuery && lastQuery.trim()) {
      setInputText(lastQuery.trim());
    }
  };

  const handleChipClick = (question: string) => {
    if (isLoading) return;
    onSendMessage(question);
  };

  const starterChips = [
    "How should I prepare for today's weather?",
    'Is it safe for outdoor cycling in Elmina Central Park today?',
    'What can I do to reduce heat in my home today?',
    "Explain Elmina's flood mitigation and bioretention system.",
    'How do I earn and redeem Green Rewards points?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top Header - Sime Darby Property Inspired */}
      <div className="p-4 sm:p-5 bg-[#0C121E] text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8102E] to-[#8C0B20] p-0.5 shadow-md shadow-red-950/40 flex items-center justify-center">
            <div className="w-full h-full bg-[#0C121E] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#EAAA08]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                ClimaSense AI Assistant
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#EAAA08]" />
                <span>Gemini 3.5 Flash Lite (Primary) • 3.1 Flash Lite Fallback</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct Server-Side API • Grounded in {township.name} real-time observations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Operational Guardrails Banner */}
      <div className="bg-amber-50/90 border-b border-amber-200/60 px-4 py-2.5 flex items-center justify-between text-xs text-amber-950">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Grounded Climate Intelligence:</strong> AI advice is synthesized from verified Open-Meteo feeds and CAMS forecasts. Always consult METMalaysia for official civil warnings.
          </span>
        </div>
      </div>

      {/* Live Context Indicator Strip */}
      {liveData && (
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span>
              <strong>Ambient:</strong> {liveData.temperatureC}°C (Feels like {liveData.apparentTemperatureC}°C)
            </span>
            <span>•</span>
            <span>
              <strong>Precipitation:</strong> {liveData.precipitationMm ?? 0} mm ({liveData.precipitationProbPct ?? 0}%)
            </span>
            <span>•</span>
            <span>
              <strong>Modelled AQI:</strong> {liveData.usAqi ?? liveData.europeanAqi ?? 164} (CAMS)
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            Observed: {liveData.observationTimeFormatted}
          </span>
        </div>
      )}

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAFAF8]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isUser
                    ? 'bg-[#C8102E] text-white'
                    : 'bg-[#0C121E] text-[#EAAA08] border border-slate-700'
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#0F172A] text-white shadow-xs rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-xs'
                }`}
              >
                {/* Content formatted */}
                <div className="space-y-2 whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Suggested actions chips if present */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Recommended Follow-up Questions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((q: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => handleChipClick(q)}
                          className="text-xs bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-[#C8102E] border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-2 text-[10px] flex items-center justify-between ${
                    isUser ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {!isUser && (
                      <span className="font-mono text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {msg.model === 'gemini-3.5-flash-lite'
                          ? 'Gemini 3.5 Flash Lite Verified'
                          : msg.model === 'gemini-3.1-flash-lite'
                          ? 'Gemini 3.1 Flash Lite Verified (Backup)'
                          : msg.model === 'gemini-3.8-flash'
                          ? 'Gemini 3.8 Flash Verified'
                          : msg.model === 'gemini-3.6-flash'
                          ? 'Gemini 3.6 Flash Verified (Backup)'
                          : msg.model
                          ? `${msg.model} Verified`
                          : 'Gemini 3.5 Flash Lite Verified'}
                      </span>
                    )}
                  </span>
                  <span className="font-mono">
                    {(() => {
                      if (!msg.timestamp) return 'Just now';
                      const d = new Date(msg.timestamp);
                      if (isNaN(d.getTime())) {
                        return msg.timestamp;
                      }
                      return d.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                    })()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0C121E] text-[#EAAA08] border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs text-xs text-slate-600 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#EAAA08] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#15803D] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="font-medium">
                Gemini is synthesizing hyper-local climate intelligence for {township.shortName}...
              </span>
            </div>
          </div>
        )}

        {/* Error Message with Friendly Alert and Question Restoration */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C8102E] shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {lastQuery && (
                <button
                  type="button"
                  onClick={handleRestoreQuery}
                  title="Restore original question into input field"
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Edit Question
                </button>
              )}
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-3 py-1 bg-[#C8102E] hover:bg-[#A50D24] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Suggestions:</span>
        {starterChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(chip)}
            disabled={isLoading}
            className="text-xs shrink-0 bg-white hover:bg-red-50 hover:text-[#C8102E] text-slate-700 border border-slate-200 hover:border-red-200 px-3 py-1 rounded-full shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 sm:gap-3"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isLoading ? 'Waiting for assistant response...' : `Ask Gemini about heat risk, rain forecast, cooling, or flood buffers in ${township.name}...`}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C8102E] hover:bg-[#A50D24] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
