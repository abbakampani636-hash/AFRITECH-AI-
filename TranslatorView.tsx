import { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Loader2,
  Trash2,
  Volume2,
} from "lucide-react";
import { motion } from "motion/react";
import { AppLanguage, TranslationMode } from "../types";
import { translations } from "../i18n/translations";
import { translateText } from "../services/api";
import { useSpeech } from "../hooks/useSpeech";
import { copyToClipboard } from "../utils/clipboard";
import { ErrorBanner } from "./ErrorBanner";

interface TranslatorViewProps {
  language: AppLanguage;
}

export function TranslatorView({ language }: TranslatorViewProps) {
  const t = translations[language].translator;
  const tc = translations[language].common;

  const [sourceLang, setSourceLang] = useState<AppLanguage>("en");
  const [targetLang, setTargetLang] = useState<AppLanguage>("ha");
  const [mode, setMode] = useState<TranslationMode>("standard");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [nuanceNote, setNuanceNote] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { ttsSupported, speak } = useSpeech(language);

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
    setNuanceNote(undefined);
    setError(null);
  };

  const handleClear = () => {
    setSourceText("");
    setTranslatedText("");
    setNuanceNote(undefined);
    setError(null);
    setCopied(false);
  };

  const handleTranslate = async () => {
    const trimmed = sourceText.trim();
    if (!trimmed) {
      setError(t.emptyError);
      return;
    }

    setError(null);
    setIsLoading(true);
    setCopied(false);

    try {
      const result = await translateText({
        text: trimmed,
        sourceLang,
        targetLang,
        mode,
      });
      setTranslatedText(result.translation);
      setNuanceNote(result.nuanceNote);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    const ok = await copyToClipboard(translatedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const modes: Array<{ id: TranslationMode; label: string }> = [
    { id: "standard", label: t.modes.standard },
    { id: "formal", label: t.modes.formal },
    { id: "conversational", label: t.modes.conversational },
  ];

  const sourceLabel = sourceLang === "en" ? t.english : t.hausa;
  const targetLabel = targetLang === "en" ? t.english : t.hausa;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header & Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            {t.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{t.subtitle}</p>
        </div>

        <div
          role="group"
          aria-label="Translation mode"
          className="inline-flex p-1 rounded-xl bg-[#0F1B33] border border-white/10 self-start"
        >
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                mode === m.id
                  ? "bg-[#D4AF37] text-[#060D1A] font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language Bar */}
      <div className="rounded-2xl bg-[#0F1B33] border border-white/10 p-3 flex items-center justify-between gap-2">
        <div className="flex-1 text-center py-2 px-3 rounded-xl bg-[#060D1A] border border-white/5 text-sm font-semibold text-[#F8FAFC]">
          {sourceLabel}
        </div>

        <button
          type="button"
          onClick={handleSwap}
          aria-label={t.swap}
          title={t.swap}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-[#132240] hover:bg-[#192C52] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center transition-transform active:scale-95 shrink-0"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <div className="flex-1 text-center py-2 px-3 rounded-xl bg-[#060D1A] border border-white/5 text-sm font-semibold text-[#D4AF37]">
          {targetLabel}
        </div>
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={sourceText.trim() ? handleTranslate : undefined}
          onDismiss={() => setError(null)}
          retryLabel={t.retry}
          dismissLabel={tc.dismiss}
        />
      )}

      {/* Dual Translation Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Pane */}
        <div className="rounded-2xl bg-[#0F1B33] border border-white/10 p-4 sm:p-5 flex flex-col justify-between gap-4 min-h-[240px]">
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{sourceLabel}</span>
              <span className="font-mono text-xs text-slate-500">
                {sourceText.length} / 5000
              </span>
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value.slice(0, 5000))}
              placeholder={
                sourceLang === "en" ? t.sourcePlaceholderEn : t.sourcePlaceholderHa
              }
              className="w-full flex-1 min-h-[150px] resize-none bg-transparent text-base text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {sourceText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#060D1A] hover:bg-white/5 border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clear}</span>
                </button>
              )}
              {ttsSupported && sourceText.trim() && (
                <button
                  type="button"
                  onClick={() => speak(sourceText, sourceLang)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#060D1A] hover:bg-white/5 border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t.listen}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim()}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 disabled:pointer-events-none text-[#060D1A] text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ml-auto"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isLoading ? t.translating : t.translateBtn}</span>
            </button>
          </div>
        </div>

        {/* Target Pane */}
        <div className="rounded-2xl bg-[#0F1B33] border border-white/10 p-4 sm:p-5 flex flex-col justify-between gap-4 min-h-[240px]">
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#D4AF37]">{targetLabel}</span>
              <span className="text-xs text-slate-400">{t.modes[mode]}</span>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                <span className="text-sm">{t.translating}</span>
              </div>
            ) : translatedText ? (
              <div className="space-y-4">
                <p className="text-base text-[#F8FAFC] leading-relaxed whitespace-pre-wrap">
                  {translatedText}
                </p>
                {nuanceNote && (
                  <div className="pt-3 border-t border-white/10 text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-[#D4AF37]">{t.nuanceLabel}: </span>
                    {nuanceNote}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 pt-2">{t.resultPlaceholder}</p>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            {ttsSupported && translatedText && (
              <button
                type="button"
                onClick={() => speak(translatedText, targetLang)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#060D1A] hover:bg-white/5 border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.listen}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!translatedText}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#132240] hover:bg-[#192C52] disabled:opacity-40 disabled:pointer-events-none border border-white/10 text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t.copy}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
