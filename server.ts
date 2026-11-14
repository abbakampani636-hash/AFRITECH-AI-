import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GeminiServiceError,
  generateImageWithGemini,
  generateTextWithFallback,
} from "./server/gemini.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: "2mb" }));

function handleApiError(res: express.Response, err: unknown) {
  if (err instanceof GeminiServiceError) {
    return res.status(err.statusCode).json({
      error: err.userMessage,
      code: err.code,
    });
  }
  console.error("Unexpected API error:", err instanceof Error ? err.message : "Unknown error");
  return res.status(500).json({
    error: "An unexpected error occurred while contacting AFRITECH AI. Please try again.",
    code: "INTERNAL_ERROR",
  });
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AFRITECH AI",
    configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
  });
});

// 1. AI Chat & Voice Assistant
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, language = "en", voiceMode = false } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please enter a message to start the conversation.",
        code: "INVALID_INPUT",
      });
    }

    const sanitizedHistory = messages
      .slice(-16)
      .filter((m: unknown): m is { role: "user" | "assistant"; content: string } => {
        if (!m || typeof m !== "object") return false;
        const item = m as Record<string, unknown>;
        return (
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string" &&
          item.content.trim().length > 0
        );
      });

    if (sanitizedHistory.length === 0) {
      return res.status(400).json({
        error: "Message content cannot be empty.",
        code: "INVALID_INPUT",
      });
    }

    const langDirective =
      language === "ha"
        ? "Respond in natural, clear Hausa unless the user explicitly asks for English or another language."
        : "Respond in clear, helpful English unless the user writes in Hausa or asks for another language.";

    const voiceDirective = voiceMode
      ? "Keep your response concise, natural for spoken audio, and free of heavy markdown formatting."
      : "Format your response clearly with clean paragraphs or concise bullet points when helpful.";

    const systemInstruction = `You are AFRITECH AI, an intelligent, respectful, and knowledgeable African technology and productivity assistant. ${langDirective} ${voiceDirective}`;

    const contents = sanitizedHistory.map((m) => ({
      role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
      parts: [{ text: m.content.trim().slice(0, 8000) }],
    }));

    const result = await generateTextWithFallback({
      contents,
      systemInstruction,
    });

    return res.json({ reply: result.text });
  } catch (err) {
    return handleApiError(res, err);
  }
});

// 2. Hausa Translator (English <-> Hausa, Standard / Formal / Conversational)
app.post("/api/ai/translate", async (req, res) => {
  try {
    const { text, sourceLang, targetLang, mode = "standard" } = req.body ?? {};
    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        error: "Please enter text to translate.",
        code: "INVALID_INPUT",
      });
    }
    if (text.trim().length > 5000) {
      return res.status(400).json({
        error: "Text is too long. Please keep translations under 5,000 characters.",
        code: "INPUT_TOO_LONG",
      });
    }

    const validLangs = new Set(["en", "ha"]);
    if (!validLangs.has(sourceLang) || !validLangs.has(targetLang) || sourceLang === targetLang) {
      return res.status(400).json({
        error: "Please choose valid source and target languages (English and Hausa).",
        code: "INVALID_LANGUAGE",
      });
    }

    const validModes = new Set(["standard", "formal", "conversational"]);
    const selectedMode = validModes.has(mode) ? mode : "standard";

    const sourceName = sourceLang === "en" ? "English" : "Hausa";
    const targetName = targetLang === "en" ? "English" : "Hausa";

    const modeGuidance =
      selectedMode === "formal"
        ? "Use formal, respectful, official register suitable for business, letters, or academic writing."
        : selectedMode === "conversational"
        ? "Use natural, warm, everyday spoken phrasing as used in daily conversation."
        : "Use clear, accurate, standard modern phrasing.";

    const systemInstruction = `You are an expert English-Hausa bilingual translator for AFRITECH AI. Translate accurately from ${sourceName} to ${targetName}. ${modeGuidance} Preserve meaning, idioms, and proper Hausa orthography (including hooked letters ɓ, ɗ, ƙ, ƴ where appropriate). Output ONLY the translated text on the first part, and optionally a brief 1-sentence context note on a new line prefixed with "NOTE: ".`;

    const result = await generateTextWithFallback({
      contents: `Translate the following ${sourceName} text into ${targetName} (${selectedMode} tone):\n\n${text.trim()}`,
      systemInstruction,
      fast: true,
    });

    const raw = result.text.trim();
    const noteMatch = raw.match(/\n+NOTE:\s*(.+)$/is);
    if (noteMatch) {
      const translation = raw.slice(0, noteMatch.index).trim();
      const nuanceNote = noteMatch[1].trim();
      return res.json({ translation: translation || raw, nuanceNote });
    }
    return res.json({ translation: raw });
  } catch (err) {
    return handleApiError(res, err);
  }
});

// 3. AI Writing
app.post("/api/ai/write", async (req, res) => {
  try {
    const { category = "letter", topic, tone = "professional", language = "en" } = req.body ?? {};
    if (typeof topic !== "string" || topic.trim().length < 3) {
      return res.status(400).json({
        error: "Please describe what you would like to write.",
        code: "INVALID_INPUT",
      });
    }

    const langName = language === "ha" ? "Hausa" : "English";
    const categoryMap: Record<string, string> = {
      letter: "formal or personal letter",
      story: "creative short story",
      caption: "engaging social media captions (provide 3 options)",
      business: "professional business document, proposal, or email",
    };
    const formatDesc = categoryMap[category] ?? "well-crafted piece of writing";

    const systemInstruction = `You are AFRITECH AI's senior editorial writer. Write in ${langName} with a ${tone} tone. Produce a polished, ready-to-use ${formatDesc}.`;

    const result = await generateTextWithFallback({
      contents: topic.trim().slice(0, 4000),
      systemInstruction,
    });

    return res.json({ content: result.text });
  } catch (err) {
    return handleApiError(res, err);
  }
});

// 4. AI Learning
app.post("/api/ai/learn", async (req, res) => {
  try {
    const { topic, level = "intermediate", language = "en" } = req.body ?? {};
    if (typeof topic !== "string" || topic.trim().length < 2) {
      return res.status(400).json({
        error: "Please enter a topic or question to learn about.",
        code: "INVALID_INPUT",
      });
    }

    const langName = language === "ha" ? "Hausa" : "English";
    const systemInstruction = `You are AFRITECH AI's expert tutor. Teach in ${langName} tailored for a ${level} learner. Structure your explanation with: 1) Clear Overview, 2) Key Concepts with relatable examples, and 3) Two quick self-check questions with answers.`;

    const result = await generateTextWithFallback({
      contents: `Explain this topic clearly: ${topic.trim().slice(0, 3000)}`,
      systemInstruction,
    });

    return res.json({ explanation: result.text });
  } catch (err) {
    return handleApiError(res, err);
  }
});

// 5. AI Summarizer
app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { text, length = "standard", language = "en" } = req.body ?? {};
    if (typeof text !== "string" || text.trim().length < 20) {
      return res.status(400).json({
        error: "Please paste at least 20 characters of text to summarize.",
        code: "INVALID_INPUT",
      });
    }

    const langName = language === "ha" ? "Hausa" : "English";
    const lengthGuide =
      length === "brief"
        ? "Provide a concise 2-3 sentence summary and 3 short bullet takeaways."
        : length === "detailed"
        ? "Provide a thorough structured summary covering main arguments, supporting details, and action items."
        : "Provide a clear 1-paragraph summary followed by 4-5 key bullet points.";

    const systemInstruction = `You are AFRITECH AI's precision summarizer. Write the summary in ${langName}. ${lengthGuide}`;

    const result = await generateTextWithFallback({
      contents: `Summarize the following text:\n\n${text.trim().slice(0, 15000)}`,
      systemInstruction,
    });

    return res.json({ summary: result.text });
  } catch (err) {
    return handleApiError(res, err);
  }
});

// 6. AI Image Generation
app.post("/api/ai/image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body ?? {};
    if (typeof prompt !== "string" || prompt.trim().length < 3) {
      return res.status(400).json({
        error: "Please enter a description for the image you want to generate.",
        code: "INVALID_INPUT",
      });
    }

    const allowedRatios = new Set(["1:1", "3:4", "4:3", "9:16", "16:9"]);
    const safeRatio = (allowedRatios.has(aspectRatio) ? aspectRatio : "1:1") as
      | "1:1"
      | "3:4"
      | "4:3"
      | "9:16"
      | "16:9";

    const result = await generateImageWithGemini({
      prompt: prompt.trim().slice(0, 1500),
      aspectRatio: safeRatio,
    });

    return res.json(result);
  } catch (err) {
    return handleApiError(res, err);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AFRITECH AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
