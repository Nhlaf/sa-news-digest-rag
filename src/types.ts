export type ArticleChunk = {
  chunk_id: string;
  text: string;
  embedding: number[];
  metadata: {
    published_at: Date | null;
    fetched_at: Date;
    language: string;
    topic_tags: string[];
    source_domain: string;
    source_url: string;
    section: string;
    headline: string;
    location_hint: string[];
  };
};

export type NewsArticle = {
  source: { domain: string; section: string; url: string };
  title: string;
  content: string;
  published_at: Date | null;
  fetched_at: Date;
  location_hint: string[];
  chunks: ArticleChunk[];
};

export type DigestQuery = {
  query: string;
  fromDate?: Date;
  toDate?: Date;
  location?: string;
  topic?: string;
  maxItems: number;
};

export type RetrievedArticle = Pick<NewsArticle, "title" | "source" | "published_at" | "location_hint"> & { content: string; score?: number };