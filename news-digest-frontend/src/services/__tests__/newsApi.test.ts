import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { newsApi, NewsApiError } from '../newsApi';

describe('newsApi', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkHealth', () => {
    it('returns health status', async () => {
      const mockResponse = { status: 'ok', service: 'news-digest-rag-agent' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await newsApi.checkHealth();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('queryNews', () => {
    it('sends query and returns digest', async () => {
      const mockResponse = {
        answer: 'Test digest',
        articles: [],
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await newsApi.queryNews({
        query: 'test',
        maxItems: 5,
      });
      expect(result).toEqual(mockResponse);
    });

    it('throws NewsApiError on failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'Invalid query' }),
      });

      await expect(newsApi.queryNews({ query: 'test' })).rejects.toThrow(
        NewsApiError
      );
    });
  });

  describe('runIngestion', () => {
    it('triggers ingestion and returns stats', async () => {
      const mockStats = {
        sourcesProcessed: 1,
        articlesFetched: 10,
        articlesStored: 10,
        errors: [],
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const result = await newsApi.runIngestion({});
      expect(result).toEqual(mockStats);
    });
  });
});
