import { useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { AppLanguage } from "../types";
import { translations } from "../i18n/translations";
import { sendChat } from "../services/api";
import { useSpeech } from "../hooks/useSpeech";
import { ErrorBanner } from "./ErrorBanner";

interface VoiceViewProps {
  language: AppLanguage;
}

export function VoiceView({ language }: VoiceViewProps) {
  const t = translations[language].voice;
  const tc = translations[language].common;

  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [fallbackInput, setFallbackInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestTranscriptRef = useRef("");

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

  const submitVoiceQuery = async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean || isProcessing) return;

    setError(null);
    setTranscript(clean);
    setIsProcessing(true);

    try {
      const { reply: aiReply } = await sendChat({
        messages: [{ role: "user", content: clean }],
        language,
        voiceMode: true,
      });
      setReply(aiReply);
      if (ttsSupported) {
        speak(aiReply, language);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tc.networkError);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMicPress = () => {
    setError(null);
    setSpeechError(null);

    if (isSpeaking) {
      stopSpeaking();
    }

    if (isListening) {
      stopListening();
      if (latestTranscriptRef.current.trim()) {
        submitVoiceQuery(latestTranscriptRef.current);
      }
      return;
    }

    latestTranscriptRef.current = "";
    setTranscript("");
    startListening((text, isFinal) => {
      latestTranscriptRef.current = text;
      setTranscript(text);
      if (isFinal && text.trim()) {
        stopListening();
        submitVoiceQuery(text);
      }
    });
  };

  const handleFallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackInput.trim() || isProcessing) return;
    const text = fallbackInput.trim();
    setFallbackInput("");
    submitVoiceQuery(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
          {t.title}
        </h1>
        <p className="text-sm text-slate-400">{t.subtitle}</p>
      </div>

      {/* Main Voice Control Card */}
      <div className="rounded-2xl bg-[#0F1B33] border border-white/10 p-6 sm:p-10 flex flex-col items-center text-center space-y-6">
        {!sttSupported && (
          <div className="w-full rounded-xl bg-[#060D1A] border border-[#D4AF37]/30 p-3.5 text-xs text-slate-300">
            {t.unsupportedNotice}
          </div>
        )}

        <button
          type="button"
          onClick={handleMicPress}
          disabled={!sttSupported || isProcessing}
          aria-label={isListening ? t.listening : t.tapToSpeak}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/50 disabled:opacity-40 disabled:pointer-events-none ${
            isListening
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
              : "bg-[#D4AF37] hover:bg-[#E5C158] text-[#060D1A] shadow-lg shadow-[#D4AF37]/20"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-9 h-9 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-9 h-9" />
          ) : (
            <Mic className="w-9 h-9" />
          )}
        </button>

        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#F8FAFC]">
            {isProcessing
              ? t.processing
              : isListening
              ? t.listening
              : isSpeaking
              ? t.speaking
              : t.tapToSpeak}
          </p>
          <p className="text-xs text-slate-400">{t.hint}</p>
        </div>

        {isSpeaking && (
          <button
            type="button"
            onClick={stopSpeaking}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#060D1A] border border-[#D4AF37]/40 text-xs font-semibold text-[#D4AF37] flex items-center gap-2 transition-colors"
          >
            <VolumeX className="w-4 h-4" />
            <span>{t.stopAudio}</span>
          </button>
        )}
      </div>

      {(error || speechError) && (
        <ErrorBanner
          message={error || speechError || ""}
          onRetry={transcript ? () => submitVoiceQuery(transcript) : undefined}
          onDismiss={() => {
            setError(null);
            setSpeechError(null);
          }}
          retryLabel={tc.retry}
          dismissLabel={tc.dismiss}
        />
      )}

      {/* Transcript & Reply Display */}
      {(transcript || reply) && (
        <div className="space-y-4">
          {transcript && (
            <div className="rounded-2xl bg-[#0F1B33] border border-white/10 p-4 sm:p-5 space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">
                {t.transcriptLabel}
              </span>
              <p className="text-sm sm:text-base text-[#F8FAFC] leading-relaxed">
                {transcript}
              </p>
            </div>
          )}

          {reply && (
            <div className="rounded-2xl bg-[#0F1B33] border border-[#D4AF37]/30 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#D4AF37]">
                  {t.replyLabel}
                </span>
                {ttsSupported && (
                  <button
                    type="button"
                    onClick={() => (isSpeaking ? stopSpeaking() : speak(reply, language))}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-[#060D1A] border border-white/10 text-xs text-slate-200 flex items-center gap-1.5"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{t.stopAudio}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{translations[language].chat.speak}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-sm sm:text-base text-[#F8FAFC] leading-relaxed whitespace-pre-wrap">
                {reply}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Text Fallback Input */}
      <form
        onSubmit={handleFallbackSubmit}
        className="rounded-2xl bg-[#0F1B33] border border-white/10 p-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={fallbackInput}
          onChange={(e) => setFallbackInput(e.target.value)}
          placeholder={t.fallbackPlaceholder}
          className="flex-1 min-h-[44px] bg-transparent px-3 text-sm text-[#F8FAFC] placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!fallbackInput.trim() || isProcessing}
          className="min-h-[44px] px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 text-[#060D1A] text-sm font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>{t.sendText}</span>
        </button>
      </form>
    </motion.div>
  );
}
