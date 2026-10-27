const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

import type {
  HealthResponse,
  IngestionRequest,
  IngestionStats,
  NewsDigestResponse,
  NewsQueryRequest,
} from '../types/news';

export class NewsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'NewsApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = 'Request failed';
    try {
      const errorBody: unknown = JSON.parse(errorText);
      if (typeof errorBody === 'object' && errorBody !== null && 'error' in errorBody && typeof errorBody.error === 'string') {
        message = errorBody.error;
      }
    } catch {
      if (errorText) message = errorText;
    }
    throw new NewsApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export const newsApi = {
  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  async queryNews(payload: NewsQueryRequest): Promise<NewsDigestResponse> {
    return request<NewsDigestResponse>('/news/query', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async runIngestion(payload: IngestionRequest = {}): Promise<IngestionStats> {
    return request<IngestionStats>('/ingest/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default newsApi;
