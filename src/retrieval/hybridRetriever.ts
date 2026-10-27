import { MistralAIEmbeddings } from "@langchain/mistralai";
import { getArticlesCollection } from "../storage/mongo.js";
import { env } from "../config/env.js";
import type { DigestQuery, RetrievedArticle } from "../types.js";

type SearchDocument = RetrievedArticle & { source: RetrievedArticle["source"]; _id: unknown };

function dateFilter(query: DigestQuery): Record<string, unknown> {
  if (!query.fromDate && !query.toDate) return {};
  return { published_at: { ...(query.fromDate ? { $gte: query.fromDate } : {}), ...(query.toDate ? { $lte: query.toDate } : {}) } };
}

export async function keywordSearch(query: DigestQuery): Promise<RetrievedArticle[]> {
  const collection = await getArticlesCollection();
  const filters: Record<string, unknown>[] = [dateFilter(query)];
  if (query.location) filters.push({ location_hint: { $regex: query.location, $options: "i" } });
  const validFilters = filters.filter((filter) => Object.keys(filter).length > 0);
  
  const pipeline: any[] = [
    { $search: { index: "news_text_search", compound: { must: [{ text: { query: query.query, path: ["title", "chunks.text", "location_hint"] } }] } } },
  ];
  
  if (validFilters.length > 0) {
    pipeline.push({ $match: { $and: validFilters } });
  }
  
  pipeline.push(
    { $project: { title: 1, content: 1, source: 1, published_at: 1, location_hint: 1, score: { $meta: "searchScore" } } },
    { $limit: query.maxItems }
  );
  
  const results = await collection.aggregate<SearchDocument>(pipeline).toArray();
  return results;
}

export async function vectorSearch(query: DigestQuery): Promise<RetrievedArticle[]> {
  if (env.KEYWORD_ONLY_MODE) return [];
  if (!env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY is required for vector search.");
  const embedder = new MistralAIEmbeddings({ apiKey: env.MISTRAL_API_KEY, model: env.MISTRAL_EMBEDDING_MODEL });
  const vector = await embedder.embedQuery(query.query);
  const collection = await getArticlesCollection();
  const results = await collection.aggregate<SearchDocument>([
    { $vectorSearch: { index: "news_vector_index", path: "chunks.embedding", queryVector: vector, numCandidates: Math.max(query.maxItems * 10, 50), limit: query.maxItems } },
    { $project: { title: 1, content: 1, source: 1, published_at: 1, location_hint: 1, score: { $meta: "vectorSearchScore" } } }
  ]).toArray();
  return results;
}

export async function hybridSearch(query: DigestQuery): Promise<RetrievedArticle[]> {
  const keywordResults = await keywordSearch(query);
  let vectorResults: RetrievedArticle[] = [];
  try {
    vectorResults = await vectorSearch(query);
  } catch (error) {
    if (!String(error).includes("429") && !String(error).toLowerCase().includes("no credits")) throw error;
  }
  const merged = new Map<string, RetrievedArticle>();
  for (const article of [...keywordResults, ...vectorResults]) merged.set(article.source.url, article);
  return [...merged.values()]
    .filter((article) => {
      if (query.fromDate && (!article.published_at || article.published_at < query.fromDate)) return false;
      if (query.toDate && (!article.published_at || article.published_at > query.toDate)) return false;
      const requestedLocation = query.location?.toLowerCase();
      if (requestedLocation && !article.location_hint?.some((location) => location.toLowerCase().includes(requestedLocation))) return false;
      return true;
    })
    .slice(0, query.maxItems);
}