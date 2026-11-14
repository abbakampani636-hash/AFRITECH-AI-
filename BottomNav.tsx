import { Home, Languages, MessageSquare, Mic, Sparkles } from "lucide-react";
import { AppLanguage, NavTab } from "../types";
import { translations } from "../i18n/translations";

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: AppLanguage;
}

export function BottomNav({ activeTab, onSelectTab, language }: BottomNavProps) {
  const t = translations[language];

  const items: Array<{ id: NavTab; label: string; icon: typeof Home }> = [
    { id: "home", label: t.nav.home, icon: Home },
    { id: "chat", label: t.nav.chat, icon: MessageSquare },
    { id: "translate", label: t.nav.translate, icon: Languages },
    { id: "studio", label: t.nav.studio, icon: Sparkles },
    { id: "voice", label: t.nav.voice, icon: Mic },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060D1A]/95 backdrop-blur-md border-t border-white/10 pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-xl mx-auto px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                isActive
                  ? "text-[#D4AF37]"
                  : "text-slate-400 hover:text-slate-200 active:text-white"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
