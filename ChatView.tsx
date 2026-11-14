import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  Mic,
  MicOff,
  Send,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion } from "motion/react";
import { AppLanguage, ChatMessage } from "../types";
import { translations } from "../i18n/translations";
import { sendChat } from "../services/api";
import { useSpeech } from "../hooks/useSpeech";
import { copyToClipboard } from "../utils/clipboard";
import { ErrorBanner } from "./ErrorBanner";

interface ChatViewProps {
  language: AppLanguage;
}

export function ChatView({ language }: ChatViewProps) {
  const t = translations[language].chat;
  const tc = translations[language].common;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const {
    sttSupported,
    ttsSupported,
    isListening,
    isSpeaking,
    speechError,
    setSpeechError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech(language);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingId(null);
    }
  }, [isSpeaking]);

  const handleSend = async (overrideText?: string) => {
    const content = (overrideText ?? input).trim();
    if (!content || isLoading) return;

    setError(null);
    setSpeechError(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!overrideText) setInput("");
    setIsLoading(true);

    try {
      const { reply } = await sendChat({
        messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        language,
      });

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
      return;
    }
    if (!sttSupported) {
      setSpeechError(t.micUnsupported);
      return;
    }
    startListening((transcript) => {
      setInput(transcript);
    });
  };

  const handleToggleSpeak = (id: string, text: string) => {
    if (isSpeaking && speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(id);
      speak(text);
    }
  };

  const handleRetryLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser || isLoading) return;
    setError(null);
    setIsLoading(true);
    sendChat({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      language,
    })
      .then(({ reply }) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : tc.networkError);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-[calc(100dvh-10.5rem)] lg:h-[calc(100dvh-8.5rem)] rounded-2xl bg-[#0F1B33] border border-white/10 overflow-hidden"
    >
      {/* Top Bar */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
        <div className="min-w-0">
          <h1 className="font-display text-lg font-semibold text-[#F8FAFC] truncate">
            {t.title}
          </h1>
          <p className="text-xs text-slate-400 truncate">{t.subtitle}</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setMessages([]);
              setError(null);
            }}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-[#060D1A] hover:bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clear}</span>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 py-8">
            <div className="space-y-2">
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F8FAFC]">
                {t.emptyTitle}
              </h2>
              <p className="text-sm text-slate-400">{t.emptySubtitle}</p>
            </div>
            <div className="w-full space-y-2.5">
              {t.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  className="w-full text-left min-h-[44px] px-4 py-3 rounded-xl bg-[#060D1A] hover:bg-[#132240] border border-white/10 hover:border-[#D4AF37]/40 text-sm text-slate-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "bg-[#D4AF37] text-[#060D1A] font-medium"
                      : "bg-[#060D1A] border border-white/10 text-[#F8FAFC]"
                  }`}
                >
                  {msg.content}
                </div>
                <div className="mt-1.5 flex items-center gap-3 px-1 text-xs text-slate-400">
                  <span className="font-mono">{msg.timestamp}</span>
                  {!isUser && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 hover:text-[#D4AF37] transition-colors py-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">{t.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.copy}</span>
                          </>
                        )}
                      </button>
                      {ttsSupported && (
                        <button
                          type="button"
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          className="inline-flex items-center gap-1 hover:text-[#D4AF37] transition-colors py-1"
                        >
                          {isSpeaking && speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span className="text-[#D4AF37]">{t.stopSpeaking}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{t.speak}</span>
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-start">
            <div className="rounded-2xl bg-[#060D1A] border border-white/10 px-4 py-3 flex items-center gap-2.5 text-sm text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
              <span>AFRITECH AI...</span>
            </div>
          </div>
        )}

        {(error || speechError) && (
          <ErrorBanner
            message={error || speechError || ""}
            onRetry={error ? handleRetryLast : undefined}
            onDismiss={() => {
              setError(null);
              setSpeechError(null);
            }}
            retryLabel={tc.retry}
            dismissLabel={tc.dismiss}
          />
        )}

        <div ref={endRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-white/10 bg-[#060D1A]/60 flex items-end gap-2 shrink-0"
      >
        <button
          type="button"
          onClick={handleToggleMic}
          aria-label={isListening ? t.listening : "Voice input"}
          className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
            isListening
              ? "bg-rose-500/20 border-rose-400 text-rose-300"
              : "bg-[#0F1B33] border-white/10 text-slate-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/40"
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={isListening ? t.listening : t.placeholder}
          className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl bg-[#0F1B33] border border-white/10 focus:border-[#D4AF37] focus:outline-none px-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="min-h-[44px] px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 disabled:pointer-events-none text-[#060D1A] font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{t.send}</span>
        </button>
      </form>
    </motion.div>
  );
}
