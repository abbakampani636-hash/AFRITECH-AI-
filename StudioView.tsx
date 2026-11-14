import { useState } from "react";
import {
  BookOpen,
  Check,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  PenTool,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { AppLanguage, StudioTool } from "../types";
import { translations } from "../i18n/translations";
import {
  explainTopic,
  generateImage,
  generateWriting,
  summarizeText,
} from "../services/api";
import { copyToClipboard } from "../utils/clipboard";
import { ErrorBanner } from "./ErrorBanner";

interface StudioViewProps {
  language: AppLanguage;
  activeTool: StudioTool;
  onSelectTool: (tool: StudioTool) => void;
}

export function StudioView({
  language,
  activeTool,
  onSelectTool,
}: StudioViewProps) {
  const t = translations[language].studio;
  const tc = translations[language].common;

  // Writing state
  const [writeCategory, setWriteCategory] = useState<"letter" | "story" | "caption" | "business">("letter");
  const [writeTone, setWriteTone] = useState("professional");
  const [writeTopic, setWriteTopic] = useState("");
  const [writeOutput, setWriteOutput] = useState("");

  // Learning state
  const [learnLevel, setLearnLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [learnTopic, setLearnTopic] = useState("");
  const [learnOutput, setLearnOutput] = useState("");

  // Summarizer state
  const [summaryLength, setSummaryLength] = useState<"brief" | "standard" | "detailed">("standard");
  const [summaryInput, setSummaryInput] = useState("");
  const [summaryOutput, setSummaryOutput] = useState("");

  // Image state
  const [imagePrompt, setImagePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3">("1:1");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const tools: Array<{ id: StudioTool; label: string; icon: typeof PenTool }> = [
    { id: "write", label: t.tabs.write, icon: PenTool },
    { id: "learn", label: t.tabs.learn, icon: BookOpen },
    { id: "summarize", label: t.tabs.summarize, icon: FileText },
    { id: "image", label: t.tabs.image, icon: ImageIcon },
  ];

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const runWrite = async () => {
    if (writeTopic.trim().length < 3 || isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const { content } = await generateWriting({
        category: writeCategory,
        topic: writeTopic.trim(),
        tone: writeTone,
        language,
      });
      setWriteOutput(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const runLearn = async () => {
    if (learnTopic.trim().length < 2 || isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const { explanation } = await explainTopic({
        topic: learnTopic.trim(),
        level: learnLevel,
        language,
      });
      setLearnOutput(explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const runSummarize = async () => {
    if (summaryInput.trim().length < 20 || isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const { summary } = await summarizeText({
        text: summaryInput.trim(),
        length: summaryLength,
        language,
      });
      setSummaryOutput(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const runImage = async () => {
    if (imagePrompt.trim().length < 3 || isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const result = await generateImage({
        prompt: imagePrompt.trim(),
        aspectRatio,
      });
      setImageUrl(result.imageUrl);
      setImageCaption(result.caption ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : tc.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const activeTextOutput =
    activeTool === "write"
      ? writeOutput
      : activeTool === "learn"
      ? learnOutput
      : activeTool === "summarize"
      ? summaryOutput
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            {t.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{t.subtitle}</p>
        </div>

        {/* Studio Sub-Navigation */}
        <div
          role="tablist"
          aria-label="Studio tools"
          className="flex items-center gap-1 p-1 rounded-xl bg-[#0F1B33] border border-white/10 overflow-x-auto"
        >
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  onSelectTool(tool.id);
                  setError(null);
                  setCopied(false);
                }}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? "bg-[#D4AF37] text-[#060D1A] font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onDismiss={() => setError(null)}
          dismissLabel={tc.dismiss}
        />
      )}

      {/* Tool Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="rounded-2xl bg-[#0F1B33] border border-white/10 p-5 space-y-5">
          {activeTool === "write" && (
            <>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">
                  {t.write.categoryLabel}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["letter", "story", "caption", "business"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setWriteCategory(cat)}
                      className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        writeCategory === cat
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-[#060D1A] border-white/10 text-slate-300 hover:text-white"
                      }`}
                    >
                      {t.write.categories[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">
                  {t.write.toneLabel}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["professional", "warm", "persuasive", "creative"] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setWriteTone(tone)}
                      className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        writeTone === tone
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-[#060D1A] border-white/10 text-slate-300 hover:text-white"
                      }`}
                    >
                      {t.write.tones[tone]}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={5}
                value={writeTopic}
                onChange={(e) => setWriteTopic(e.target.value)}
                placeholder={t.write.topicPlaceholder}
                className="w-full rounded-xl bg-[#060D1A] border border-white/10 focus:border-[#D4AF37] focus:outline-none p-4 text-sm text-[#F8FAFC] placeholder:text-slate-500 resize-none"
              />

              <button
                type="button"
                onClick={runWrite}
                disabled={isLoading || writeTopic.trim().length < 3}
                className="w-full min-h-[44px] rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 text-[#060D1A] text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? t.write.generating : t.write.generateBtn}</span>
              </button>
            </>
          )}

          {activeTool === "learn" && (
            <>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">
                  {t.learn.levelLabel}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLearnLevel(lvl)}
                      className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        learnLevel === lvl
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-[#060D1A] border-white/10 text-slate-300 hover:text-white"
                      }`}
                    >
                      {t.learn.levels[lvl]}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={6}
                value={learnTopic}
                onChange={(e) => setLearnTopic(e.target.value)}
                placeholder={t.learn.topicPlaceholder}
                className="w-full rounded-xl bg-[#060D1A] border border-white/10 focus:border-[#D4AF37] focus:outline-none p-4 text-sm text-[#F8FAFC] placeholder:text-slate-500 resize-none"
              />

              <button
                type="button"
                onClick={runLearn}
                disabled={isLoading || learnTopic.trim().length < 2}
                className="w-full min-h-[44px] rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 text-[#060D1A] text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? t.learn.explaining : t.learn.explainBtn}</span>
              </button>
            </>
          )}

          {activeTool === "summarize" && (
            <>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">
                  {t.summarize.lengthLabel}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["brief", "standard", "detailed"] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setSummaryLength(len)}
                      className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        summaryLength === len
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-[#060D1A] border-white/10 text-slate-300 hover:text-white"
                      }`}
                    >
                      {t.summarize.lengths[len]}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={7}
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder={t.summarize.textPlaceholder}
                className="w-full rounded-xl bg-[#060D1A] border border-white/10 focus:border-[#D4AF37] focus:outline-none p-4 text-sm text-[#F8FAFC] placeholder:text-slate-500 resize-none"
              />

              <div className="flex items-center gap-2">
                {summaryInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSummaryInput("");
                      setSummaryOutput("");
                    }}
                    className="min-h-[44px] px-4 rounded-xl bg-[#060D1A] border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.clear}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={runSummarize}
                  disabled={isLoading || summaryInput.trim().length < 20}
                  className="flex-1 min-h-[44px] rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 text-[#060D1A] text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isLoading ? t.summarize.summarizing : t.summarize.summarizeBtn}</span>
                </button>
              </div>
            </>
          )}

          {activeTool === "image" && (
            <>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">
                  {t.image.aspectLabel}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {(["1:1", "16:9", "9:16", "4:3"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`min-h-[40px] px-3 py-2 rounded-xl font-mono text-xs font-medium border transition-colors ${
                        aspectRatio === ratio
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-[#060D1A] border-white/10 text-slate-300 hover:text-white"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={5}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder={t.image.promptPlaceholder}
                className="w-full rounded-xl bg-[#060D1A] border border-white/10 focus:border-[#D4AF37] focus:outline-none p-4 text-sm text-[#F8FAFC] placeholder:text-slate-500 resize-none"
              />

              <button
                type="button"
                onClick={runImage}
                disabled={isLoading || imagePrompt.trim().length < 3}
                className="w-full min-h-[44px] rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 text-[#060D1A] text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? t.image.generating : t.image.generateBtn}</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Output */}
        <div className="rounded-2xl bg-[#0F1B33] border border-white/10 p-5 flex flex-col justify-between min-h-[320px]">
          {activeTool === "image" ? (
            <div className="flex-1 flex flex-col justify-between gap-4">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 py-12">
                  <Loader2 className="w-7 h-7 animate-spin text-[#D4AF37]" />
                  <span className="text-sm">{t.image.generating}</span>
                </div>
              ) : imageUrl ? (
                <div className="space-y-3">
                  <img
                    src={imageUrl}
                    alt={imagePrompt}
                    referrerPolicy="no-referrer"
                    className="w-full rounded-xl border border-white/10 object-contain max-h-[380px] bg-[#060D1A]"
                  />
                  {imageCaption && (
                    <p className="text-xs text-slate-300">{imageCaption}</p>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-12 space-y-2">
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                  <p className="text-sm">{t.image.emptyState}</p>
                </div>
              )}

              {imageUrl && (
                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <a
                    href={imageUrl}
                    download={`afritech-ai-${Date.now()}.png`}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#132240] hover:bg-[#192C52] border border-white/10 text-xs font-semibold text-[#F8FAFC] flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t.image.download}</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                    <span className="text-sm">AFRITECH AI...</span>
                  </div>
                ) : activeTextOutput ? (
                  <div className="text-sm sm:text-base text-[#F8FAFC] leading-relaxed whitespace-pre-wrap">
                    {activeTextOutput}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    {translations[language].translator.resultPlaceholder}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  disabled={!activeTextOutput}
                  onClick={() => handleCopy(activeTextOutput)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#132240] hover:bg-[#192C52] disabled:opacity-40 border border-white/10 text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5 transition-colors"
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
          )}
        </div>
      </div>
    </motion.div>
  );
}
