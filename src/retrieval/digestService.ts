import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { env } from "../config/env.js";
import type { DigestQuery, RetrievedArticle } from "../types.js";
import { hybridSearch } from "./hybridRetriever.js";

const digestPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are News Digest Agent. Summarise only the supplied South African news context. Group updates by topic or location when useful. Include each source title, publisher URL, and publication date. If the context does not answer the question, say so clearly."],
  ["human", "Question: {question}\n\nNews context:\n{context}"]
]);

function formatContext(articles: RetrievedArticle[]): string {
  return articles.map((article, index) => `${index + 1}. ${article.title}\nSource: ${article.source.domain} (${article.source.url})\nPublished: ${article.published_at?.toISOString() ?? "unknown"}\n${article.content}`).join("\n\n");
}

export async function answerDigest(query: DigestQuery): Promise<{ answer: string; articles: RetrievedArticle[] }> {
  if (!env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is required to generate a news digest.");
  const articles = await hybridSearch(query);
  const prompt = await digestPrompt.format({ question: query.query, context: formatContext(articles) || "No matching articles were retrieved." });
  const model = new ChatGroq({ apiKey: env.GROQ_API_KEY, model: env.GROQ_CHAT_MODEL, temperature: 0.2 });
  const response = await model.invoke(prompt);
  return { answer: typeof response.content === "string" ? response.content : JSON.stringify(response.content), articles };
}