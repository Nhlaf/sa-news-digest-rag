export interface HealthResponse {
  status: 'ok';
  service: string;
}

export interface NewsSource {
  domain: string;
  section: string;
  url: string;
}

export interface RetrievedArticle {
  title: string;
  content: string;
  source: NewsSource;
  published_at: string | null;
  location_hint?: string[];
  score?: number;
}

export interface NewsDigestResponse {
  answer: string;
  articles: RetrievedArticle[];
}

export interface IngestionStats {
  sourcesProcessed: number;
  articlesFetched: number;
  articlesStored: number;
  errors: string[];
}

export interface NewsQueryRequest {
  query: string;
  fromDate?: string | Date;
  toDate?: string | Date;
  location?: string;
  topic?: string;
  maxItems?: number;
}

export interface IngestionRequest {
  sourceIds?: string[];
}
