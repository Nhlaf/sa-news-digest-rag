import dotenv from "dotenv";
import { z } from "zod";
import type { NewsSource } from "./newsSources.js";

dotenv.config({ override: true });

const envBoolean = z.preprocess((value) => {
  if (typeof value === "string") return value.toLowerCase() === "true";
  return value;
}, z.boolean());

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017"),
  MONGODB_DATABASE: z.string().min(1).default("news_rag_db"),
  MISTRAL_API_KEY: z.string().optional(),
  MISTRAL_EMBEDDING_MODEL: z.string().default("mistral-embed"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_CHAT_MODEL: z.string().default("openai/gpt-oss-120b"),
  KEYWORD_ONLY_MODE: envBoolean.default(false),
  NEWS_SOURCE_URLS: z.string().min(1, "NEWS_SOURCE_URLS must contain at least one URL"),
  NEWS_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  NEWS_MAX_ARTICLES_PER_SOURCE: z.coerce.number().int().positive().default(20),
  NEWS_CHUNK_SIZE: z.coerce.number().int().positive().default(800),
  NEWS_CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(120),
  PLAYWRIGHT_FALLBACK: envBoolean.default(false)
});

export const env = envSchema.parse(process.env);

export function configuredSources(): NewsSource[] {
  return env.NEWS_SOURCE_URLS.split(",").map((url, index) => {
    const parsed = new URL(url.trim());
    return { id: `${parsed.hostname}-${index}`, domain: parsed.hostname, section: parsed.pathname.replace(/^\//, "") || "news", url: parsed.toString(), pageType: "list" } satisfies NewsSource;
  });
}