import {
  ArrowRight,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Languages,
  MessageSquare,
  Mic,
  PenTool,
} from "lucide-react";
import { motion } from "motion/react";
import { AppLanguage, NavTab, StudioTool } from "../types";
import { translations } from "../i18n/translations";

interface DashboardViewProps {
  language: AppLanguage;
  onNavigate: (tab: NavTab, studioTool?: StudioTool) => void;
}

export function DashboardView({ language, onNavigate }: DashboardViewProps) {
  const t = translations[language].dashboard;

  const featureCards: Array<{
    id: string;
    title: string;
    desc: string;
    icon: typeof MessageSquare;
    tab: NavTab;
    studioTool?: StudioTool;
  }> = [
    {
      id: "chat",
      title: t.features.chatTitle,
      desc: t.features.chatDesc,
      icon: MessageSquare,
      tab: "chat",
    },
    {
      id: "translate",
      title: t.features.translateTitle,
      desc: t.features.translateDesc,
      icon: Languages,
      tab: "translate",
    },
    {
      id: "voice",
      title: t.features.voiceTitle,
      desc: t.features.voiceDesc,
      icon: Mic,
      tab: "voice",
    },
    {
      id: "write",
      title: t.features.writeTitle,
      desc: t.features.writeDesc,
      icon: PenTool,
      tab: "studio",
      studioTool: "write",
    },
    {
      id: "learn",
      title: t.features.learnTitle,
      desc: t.features.learnDesc,
      icon: BookOpen,
      tab: "studio",
      studioTool: "learn",
    },
    {
      id: "summarize",
      title: t.features.summarizeTitle,
      desc: t.features.summarizeDesc,
      icon: FileText,
      tab: "studio",
      studioTool: "summarize",
    },
    {
      id: "image",
      title: t.features.imageTitle,
      desc: t.features.imageDesc,
      icon: ImageIcon,
      tab: "studio",
      studioTool: "image",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-10"
    >
      {/* Hero Section */}
      <section className="rounded-2xl bg-[#0F1B33] border border-white/10 p-6 sm:p-10">
        <div className="max-w-3xl space-y-5">
          <p className="text-xs sm:text-sm font-medium text-[#D4AF37] tracking-wide">
            {t.greeting}
          </p>
          <h1
            className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-[#F8FAFC] leading-tight"
            style={{ textWrap: "balance" }}
          >
            {t.headline}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {t.subheadline}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("chat")}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#060D1A] text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 active:scale-[0.98]"
            >
              <span>{t.startChat}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("translate")}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#132240] hover:bg-[#192C52] border border-white/15 text-[#F8FAFC] text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 active:scale-[0.98]"
            >
              <Languages className="w-4 h-4 text-[#D4AF37]" />
              <span>{t.openTranslator}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Workspace Tools Grid */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F8FAFC]">
              {t.toolsTitle}
            </h2>
            <p className="text-sm text-slate-400 mt-1">{t.toolsSubtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.tab, card.studioTool)}
                className="group text-left rounded-2xl bg-[#0F1B33] hover:bg-[#132240] border border-white/10 hover:border-[#D4AF37]/40 p-5 flex flex-col justify-between gap-4 transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#060D1A] border border-white/10 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37]/40 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-base font-semibold text-[#F8FAFC] group-hover:text-[#D4AF37] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#D4AF37]">
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
