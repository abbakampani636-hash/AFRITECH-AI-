import { GoogleGenAI, GenerateContentResponse, ThinkingLevel } from "@google/genai";

export const PRIMARY_TEXT_MODEL = "gemini-3.8-flash";
export const FALLBACK_TEXT_MODELS = ["gemini-3.1-flash-lite", "gemini-flash-latest"];
export const IMAGE_MODEL = "gemini-3.1-flash-lite-image";

const DEFAULT_TIMEOUT_MS = 25000;
const IMAGE_TIMEOUT_MS = 45000;
const MAX_RETRIES_PER_MODEL = 2;
const BASE_BACKOFF_MS = 800;

export class GeminiServiceError extends Error {
  statusCode: number;
  code: string;
  userMessage: string;

  constructor(statusCode: number, code: string, userMessage: string) {
    super(userMessage);
    this.name = "GeminiServiceError";
    this.statusCode = statusCode;
    this.code = code;
    this.userMessage = userMessage;
  }
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiServiceError(
      503,
      "MISSING_API_KEY",
      "The AI service is not configured yet. Please add a valid GEMINI_API_KEY in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractStatusAndMessage(err: unknown): { status?: number; message: string } {
  if (!err || typeof err !== "object") {
    return { message: String(err ?? "Unknown error") };
  }
  const e = err as Record<string, unknown>;
  const status =
    typeof e.status === "number"
      ? e.status
      : typeof e.statusCode === "number"
      ? e.statusCode
      : typeof e.code === "number"
      ? e.code
      : undefined;
  const message = typeof e.message === "string" ? e.message : String(err);
  return { status, message };
}

function isRetryableError(err: unknown): boolean {
  const { status, message } = extractStatusAndMessage(err);
  const lower = message.toLowerCase();
  if (status === 429 || status === 503 || status === 502 || status === 504) {
    return true;
  }
  return (
    lower.includes("429") ||
    lower.includes("503") ||
    lower.includes("resource_exhausted") ||
    lower.includes("unavailable") ||
    lower.includes("overloaded") ||
    lower.includes("timeout") ||
    lower.includes("econnreset") ||
    lower.includes("etimedout")
  );
}

function mapFriendlyError(err: unknown, isImage = false): GeminiServiceError {
  if (err instanceof GeminiServiceError) {
    return err;
  }

  const { status, message } = extractStatusAndMessage(err);
  const lower = message.toLowerCase();

  if (lower.includes("request_timeout")) {
    return new GeminiServiceError(
      504,
      "TIMEOUT",
      "The AI request took too long to respond. Please try again."
    );
  }

  if (
    status === 401 ||
    status === 403 ||
    lower.includes("permission_denied") ||
    lower.includes("api_key_invalid") ||
    lower.includes("api key not valid")
  ) {
    if (isImage) {
      return new GeminiServiceError(
        403,
        "PAID_KEY_REQUIRED",
        "AI Image Generation requires a billing-enabled Gemini API key in Settings > Secrets."
      );
    }
    return new GeminiServiceError(
      403,
      "AUTH_ERROR",
      "The AI service credentials could not be verified. Please check your GEMINI_API_KEY in Settings > Secrets."
    );
  }

  if (status === 429 || lower.includes("resource_exhausted") || lower.includes("quota")) {
    if (isImage) {
      return new GeminiServiceError(
        429,
        "IMAGE_QUOTA",
        "Image generation quota reached or requires a billing-enabled API key in Settings > Secrets."
      );
    }
    return new GeminiServiceError(
      429,
      "RATE_LIMIT",
      "AFRITECH AI is experiencing high demand right now. Please wait a moment and try again."
    );
  }

  if (status === 503 || lower.includes("unavailable") || lower.includes("overloaded")) {
    return new GeminiServiceError(
      503,
      "SERVICE_UNAVAILABLE",
      "The AI service is temporarily busy. Please try again in a few seconds."
    );
  }

  if (status === 400 || lower.includes("invalid_argument") || lower.includes("safety")) {
    return new GeminiServiceError(
      400,
      "INVALID_REQUEST",
      "Your request could not be processed. Please rephrase your input and try again."
    );
  }

  return new GeminiServiceError(
    502,
    "AI_UNAVAILABLE",
    "We could not complete your request right now. Please try again shortly."
  );
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("REQUEST_TIMEOUT"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function generateTextWithFallback(params: {
  contents: string | Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
  systemInstruction?: string;
  fast?: boolean;
  timeoutMs?: number;
}): Promise<{ text: string; modelUsed: string }> {
  const ai = getClient();
  const models = [PRIMARY_TEXT_MODEL, ...FALLBACK_TEXT_MODELS];
  const timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const config: Record<string, unknown> = {};
        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }

        const response: GenerateContentResponse = await withTimeout(
          ai.models.generateContent({
            model,
            contents: params.contents,
            config: Object.keys(config).length > 0 ? config : undefined,
          }),
          timeoutMs
        );

        const text = response.text?.trim();
        if (!text) {
          throw new Error("EMPTY_RESPONSE");
        }

        return { text, modelUsed: model };
      } catch (err) {
        lastError = err;
        const retryable = isRetryableError(err);
        if (retryable && attempt < MAX_RETRIES_PER_MODEL) {
          const jitter = Math.floor(Math.random() * 250);
          const delay = BASE_BACKOFF_MS * Math.pow(2, attempt) + jitter;
          await sleep(delay);
          continue;
        }
        // Move to next fallback model if retryable or 404 model not found
        const { status, message } = extractStatusAndMessage(err);
        if (retryable || status === 404 || message.toLowerCase().includes("not_found")) {
          break;
        }
        // Non-retryable client/auth error: fail immediately
        throw mapFriendlyError(err, false);
      }
    }
  }

  throw mapFriendlyError(lastError, false);
}

export async function generateImageWithGemini(params: {
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}): Promise<{ imageUrl: string; caption?: string }> {
  const ai = getClient();
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: {
            parts: [{ text: params.prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: params.aspectRatio,
            },
          },
        }),
        IMAGE_TIMEOUT_MS
      );

      let imageUrl = "";
      let caption = "";

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          caption += part.text;
        }
      }

      if (!imageUrl) {
        throw new GeminiServiceError(
          502,
          "NO_IMAGE_RETURNED",
          "No image was generated for this prompt. Please try a more descriptive prompt."
        );
      }

      return { imageUrl, caption: caption.trim() || undefined };
    } catch (err) {
      lastError = err;
      if (isRetryableError(err) && attempt < MAX_RETRIES_PER_MODEL) {
        const jitter = Math.floor(Math.random() * 250);
        const delay = BASE_BACKOFF_MS * Math.pow(2, attempt) + jitter;
        await sleep(delay);
        continue;
      }
      throw mapFriendlyError(err, true);
    }
  }

  throw mapFriendlyError(lastError, true);
}
