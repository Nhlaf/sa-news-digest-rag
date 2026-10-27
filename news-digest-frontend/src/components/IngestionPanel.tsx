type IngestionPanelProps = {
  loading: boolean;
  result: {
    sourcesProcessed: number;
    articlesFetched: number;
    articlesStored: number;
    errors: string[];
  } | null;
  error: string;
  onRunIngestion: () => void;
};

export default function IngestionPanel({ loading, result, error, onRunIngestion }: IngestionPanelProps) {
  return (
    <section className="panel ingestion-panel">
      <h2>News Data</h2>
      <p>Update the database with the latest articles from the configured South African news sources.</p>
      <button type="button" className="secondary-button" onClick={onRunIngestion} disabled={loading}>
        {loading ? 'Ingesting...' : 'Run Ingestion'}
      </button>

      {error ? <div className="message error">{error}</div> : null}

      {result ? (
        <div className="ingestion-result">
          <h3>Ingestion Complete</h3>
          <ul>
            <li>Sources processed: {result.sourcesProcessed}</li>
            <li>Articles fetched: {result.articlesFetched}</li>
            <li>Articles stored: {result.articlesStored}</li>
            <li>Errors: {result.errors.length}</li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
