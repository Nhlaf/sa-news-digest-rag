import { useEffect, useState } from 'react';
import ErrorMessage from '../components/ErrorMessage';
import Header from '../components/Header';
import IngestionPanel from '../components/IngestionPanel';
import LoadingState from '../components/LoadingState';
import NewsDigest from '../components/NewsDigest';
import QueryForm from '../components/QueryForm';
import newsApi, { NewsApiError } from '../services/newsApi';
import type { HealthResponse, IngestionStats, NewsDigestResponse } from '../types/news';

const defaultQuery = 'Summarise South African technology news from today';

function NewsDigestPage() {
  const [activeTab, setActiveTab] = useState<'query' | 'ingest'>('query');
  const [query, setQuery] = useState(defaultQuery);
  const [location, setLocation] = useState('South Africa');
  const [maxItems, setMaxItems] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [digest, setDigest] = useState<NewsDigestResponse | null>(null);
  const [backendStatus, setBackendStatus] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [ingestionLoading, setIngestionLoading] = useState(false);
  const [ingestionResult, setIngestionResult] = useState<IngestionStats | null>(null);
  const [ingestionError, setIngestionError] = useState('');

  useEffect(() => {
    let active = true;

    newsApi.checkHealth()
      .then((response) => {
        if (active) setBackendStatus(response);
      })
      .catch(() => {
        if (active) setBackendStatus(null);
      })
      .finally(() => {
        if (active) setHealthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setDigest(null);
    setLoading(true);

    try {
      const submittedAt = new Date();
      const todayStart = new Date(submittedAt);
      todayStart.setHours(0, 0, 0, 0);

      const response = await newsApi.queryNews({
        query,
        ...(location.trim() ? { location: location.trim() } : {}),
        maxItems,
        ...( /\btoday\b/i.test(query)
          ? { fromDate: todayStart.toISOString(), toDate: submittedAt.toISOString() }
          : {}),
      });
      setDigest(response);
    } catch (requestError) {
      setError(
        requestError instanceof NewsApiError && requestError.status === 429
          ? requestError.message
          : "We couldn't generate the news digest. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleIngestion() {
    setIngestionError('');
    setIngestionResult(null);
    setIngestionLoading(true);

    try {
      const result = await newsApi.runIngestion({});
      setIngestionResult(result);
    } catch {
      setIngestionError('News ingestion failed. Please try again.');
    } finally {
      setIngestionLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <Header loading={healthLoading} online={Boolean(backendStatus)} />

      <div className="content-grid">
        <div className="left-column">
          <section className="panel control-panel">
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'query' ? 'active' : ''}`}
                onClick={() => setActiveTab('query')}
              >
                📰 Query Digest
              </button>
              <button 
                className={`tab-button ${activeTab === 'ingest' ? 'active' : ''}`}
                onClick={() => setActiveTab('ingest')}
              >
                📥 Ingest News
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'query' ? (
                <QueryForm
                  query={query}
                  location={location}
                  maxItems={maxItems}
                  loading={loading}
                  onQueryChange={setQuery}
                  onLocationChange={setLocation}
                  onMaxItemsChange={setMaxItems}
                  onSubmit={handleSubmit}
                />
              ) : (
                <div className="ingestion-controls">
                  <p className="info-text">
                    Update the database with the latest articles from configured South African news sources.
                  </p>
                  <button 
                    type="button"
                    className="primary-button"
                    onClick={handleIngestion}
                    disabled={ingestionLoading}
                  >
                    {ingestionLoading ? '⏳ Ingesting...' : '🚀 Run Ingestion'}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="right-column">
          <section className="panel results-panel">
            <h2>📊 Results</h2>
            
            {error ? <ErrorMessage message={error} /> : null}
            {ingestionError ? <ErrorMessage message={ingestionError} /> : null}
            
            {loading || ingestionLoading ? <LoadingState /> : null}
            
            {ingestionResult && !ingestionLoading ? (
              <div className="ingestion-result">
                <h3>Ingestion Complete</h3>
                <ul>
                  <li>Sources processed: {ingestionResult.sourcesProcessed}</li>
                  <li>Articles fetched: {ingestionResult.articlesFetched}</li>
                  <li>Articles stored: {ingestionResult.articlesStored}</li>
                  {ingestionResult.errors > 0 && <li>Errors: {ingestionResult.errors}</li>}
                </ul>
              </div>
            ) : null}
            
            <NewsDigest digest={digest} />
          </section>
        </div>
      </div>
    </main>
  );
}

export default NewsDigestPage;
