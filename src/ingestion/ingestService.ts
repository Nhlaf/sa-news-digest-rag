import { MistralAIEmbeddings } from "@langchain/mistralai";
import { env } from "../config/env.js";
import type { NewsSource } from "../config/newsSources.js";
import type { ArticleChunk, NewsArticle } from "../types.js";
import { splitText } from "../utils/text.js";
import { getArticlesCollection } from "../storage/mongo.js";
import { discoverArticleUrls, extractArticle } from "./webLoader.js";

export type IngestionStats = { sourcesProcessed: number; articlesFetched: number; articlesStored: number; errors: string[] };

function embeddings(): MistralAIEmbeddings | null {
  if (env.KEYWORD_ONLY_MODE) return null;
  if (!env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY is required for generating embeddings during ingestion.");
  return new MistralAIEmbeddings({ apiKey: env.MISTRAL_API_KEY, model: env.MISTRAL_EMBEDDING_MODEL });
}

export async function ingestSources(sources: NewsSource[]): Promise<IngestionStats> {
  const stats: IngestionStats = { sourcesProcessed: 0, articlesFetched: 0, articlesStored: 0, errors: [] };
  const embedder = embeddings();
  const collection = await getArticlesCollection();
  for (const source of sources) {
    try {
      const urls = source.pageType === "article" ? [source.url] : (await discoverArticleUrls(source)).slice(0, env.NEWS_MAX_ARTICLES_PER_SOURCE);
      for (const url of urls) {
        try {
          const article = await extractArticle(url, source);
          if (!article) continue;
          const texts = splitText(article.content, env.NEWS_CHUNK_SIZE, env.NEWS_CHUNK_OVERLAP);
          let vectors: number[][] = [];
          if (embedder) {
            try {
              vectors = await embedder.embedDocuments(texts);
            } catch (error) {
              if (!String(error).includes("429") && !String(error).toLowerCase().includes("no credits")) throw error;
              stats.errors.push(`${url}: embeddings unavailable; stored for keyword search only`);
            }
          }
          const fetchedAt = new Date();
          const chunks: ArticleChunk[] = texts.map((text, index) => ({
            chunk_id: `${Buffer.from(url).toString("base64url")}-${index + 1}`,
            text,
            embedding: vectors[index] ?? [],
            metadata: {
              published_at: article.publishedAt,
              fetched_at: fetchedAt,
              language: "en",
              topic_tags: [source.section],
              source_domain: source.domain,
              source_url: url,
              section: source.section,
              headline: article.title,
              location_hint: source.locationHint ?? ["South Africa"]
            }
          }));
          const document: NewsArticle = {
            source: { domain: source.domain, section: source.section, url },
            title: article.title,
            content: article.content,
            published_at: article.publishedAt,
            fetched_at: fetchedAt,
            location_hint: source.locationHint ?? ["South Africa"],
            chunks
          };
          await collection.replaceOne({ "source.url": url }, document, { upsert: true });
          stats.articlesFetched += 1;
          stats.articlesStored += 1;
        } catch (error) {
          stats.errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      stats.sourcesProcessed += 1;
    } catch (error) {
      stats.errors.push(`${source.url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return stats;
}