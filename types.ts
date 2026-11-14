export type AppLanguage = "en" | "ha";

export type NavTab = "home" | "chat" | "translate" | "studio" | "voice";

export type StudioTool = "write" | "learn" | "summarize" | "image";

export type TranslationMode = "standard" | "formal" | "conversational";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface TranslationResult {
  translation: string;
  nuanceNote?: string;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
}
