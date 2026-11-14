import { useState } from "react";
import { AppLanguage, NavTab, StudioTool } from "./types";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { DashboardView } from "./components/DashboardView";
import { ChatView } from "./components/ChatView";
import { TranslatorView } from "./components/TranslatorView";
import { StudioView } from "./components/StudioView";
import { VoiceView } from "./components/VoiceView";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [studioTool, setStudioTool] = useState<StudioTool>("write");
  const [language, setLanguage] = useState<AppLanguage>("en");

  const handleNavigate = (tab: NavTab, tool?: StudioTool) => {
    setActiveTab(tab);
    if (tool) {
      setStudioTool(tool);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#060D1A] text-[#F8FAFC]">
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        language={language}
        onChangeLanguage={setLanguage}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-10">
        {activeTab === "home" && (
          <DashboardView language={language} onNavigate={handleNavigate} />
        )}
        {activeTab === "chat" && <ChatView language={language} />}
        {activeTab === "translate" && <TranslatorView language={language} />}
        {activeTab === "studio" && (
          <StudioView
            language={language}
            activeTool={studioTool}
            onSelectTool={setStudioTool}
          />
        )}
        {activeTab === "voice" && <VoiceView language={language} />}
      </main>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        language={language}
      />
    </div>
  );
}
