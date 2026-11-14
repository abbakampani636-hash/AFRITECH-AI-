import { AppLanguage, NavTab } from "../types";
import { translations } from "../i18n/translations";

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
}

export function Header({
  activeTab,
  onSelectTab,
  language,
  onChangeLanguage,
}: HeaderProps) {
  const t = translations[language];

  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: "home", label: t.nav.home },
    { id: "chat", label: t.nav.chat },
    { id: "translate", label: t.nav.translate },
    { id: "studio", label: t.nav.studio },
    { id: "voice", label: t.nav.voice },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#060D1A]/90 backdrop-blur-md border-b border-white/10 pt-safe">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab("home")}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md px-1"
        >
          AFRITECH <span className="text-[#D4AF37]">AI</span>
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-6"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md px-2 ${
                  isActive
                    ? "text-[#D4AF37]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#D4AF37] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language Selector (EN / HA) */}
        <div
          role="group"
          aria-label="Language selector"
          className="flex items-center p-1 bg-[#0F1B33] border border-white/10 rounded-lg shrink-0"
        >
          <button
            type="button"
            onClick={() => onChangeLanguage("en")}
            className={`min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
              language === "en"
                ? "bg-[#D4AF37] text-[#060D1A]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onChangeLanguage("ha")}
            className={`min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
              language === "ha"
                ? "bg-[#D4AF37] text-[#060D1A]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            HA
          </button>
        </div>
      </div>
    </header>
  );
}
