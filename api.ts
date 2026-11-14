import { AppLanguage, ChatMessage, TranslationMode, TranslationResult } from "../types";

const CLIENT_TIMEOUT_MS = 35000;

export class ApiClientError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
  }
}

async function postJson<T>(url: string, body: unknown, timeoutMs = CLIENT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        typeof data?.error === "string" && data.error.trim()
          ? data.error
          : "Unable to complete your request. Please try again.";
      throw new ApiClientError(message, typeof data?.code === "string" ? data.code : undefined);
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiClientError("The request timed out. Please try again.", "TIMEOUT");
    }
    throw new ApiClientError(
      "Network connection issue. Please check your internet and try again.",
      "NETWORK_ERROR"
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function sendChat(params: {
  messages: Array<Pick<ChatMessage, "role" | "content">>;
  language: AppLanguage;
  voiceMode?: boolean;
}): Promise<{ reply: string }> {
  return postJson<{ reply: string }>("/api/ai/chat", params);
}

export async function translateText(params: {
  text: string;
  sourceLang: AppLanguage;
  targetLang: AppLanguage;
  mode: TranslationMode;
}): Promise<TranslationResult> {
  return postJson<TranslationResult>("/api/ai/translate", params);
}

export async function generateWriting(params: {
  category: "letter" | "story" | "caption" | "business";
  topic: string;
  tone: string;
  language: AppLanguage;
}): Promise<{ content: string }> {
  return postJson<{ content: string }>("/api/ai/write", params);
}

export async function explainTopic(params: {
  topic: string;
  level: "beginner" | "intermediate" | "advanced";
  language: AppLanguage;
}): Promise<{ explanation: string }> {
  return postJson<{ explanation: string }>("/api/ai/learn", params);
}

export async function summarizeText(params: {
  text: string;
  length: "brief" | "standard" | "detailed";
  language: AppLanguage;
}): Promise<{ summary: string }> {
  return postJson<{ summary: string }>("/api/ai/summarize", params);
}

export async function generateImage(params: {
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}): Promise<{ imageUrl: string; caption?: string }> {
  return postJson<{ imageUrl: string; caption?: string }>("/api/ai/image", params, 50000);
}
