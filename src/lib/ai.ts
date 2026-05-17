import OpenAI from "openai";
import type { AiOutput } from "./types";

export function isAiConfigured(): boolean {
  return Boolean(process.env.LLM_API_KEY?.trim());
}

function getClient(): OpenAI {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("LLM_API_KEY is not configured");
  return new OpenAI({
    apiKey,
    baseURL: getBaseUrl(),
  });
}

export async function generateNoteInsights(
  content: string,
  title?: string
): Promise<AiOutput> {
  if (!isAiConfigured()) {
    return getMockAiOutput(content, title);
  }

  const client = getClient();
  const response = await client.chat.completions.create({
    model: getModel(),
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You analyze notes and return JSON with exactly these keys:
- "summary": 2-4 sentence summary
- "action_items": array of concrete action strings (empty array if none)
- "suggested_title": concise title under 60 chars`,
      },
      {
        role: "user",
        content: `Title: ${title || "Untitled"}\n\nContent:\n${content.slice(0, 8000)}`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response");

  const parsed = JSON.parse(raw) as Partial<AiOutput>;
  return {
    summary: parsed.summary ?? "No summary generated.",
    action_items: Array.isArray(parsed.action_items)
      ? parsed.action_items.map(String)
      : [],
    suggested_title: parsed.suggested_title ?? title ?? "Untitled Note",
  };
}

function getModel(): string {
  return process.env.LLM_MODEL ?? "gemini-2.5-flash";
}

function getBaseUrl(): string | undefined {
  if (process.env.LLM_BASE_URL) return process.env.LLM_BASE_URL;
  return getModel().startsWith("gemini-")
    ? "https://generativelanguage.googleapis.com/v1beta/openai/"
    : undefined;
}

function getMockAiOutput(content: string, title?: string): AiOutput {
  const preview = content.trim().slice(0, 120) || "Empty note";
  const words = content.split(/\s+/).filter(Boolean);
  const actionItems =
    words.length > 20
      ? ["Review and refine note content", "Share with collaborators"]
      : words.length > 5
        ? ["Expand note with more details"]
        : [];

  return {
    summary: `This note covers: ${preview}${content.length > 120 ? "..." : ""} (Demo mode — add LLM_API_KEY for real AI summaries.)`,
    action_items: actionItems,
    suggested_title:
      title && title !== "Untitled"
        ? title
        : preview.slice(0, 50) || "New Note",
  };
}
