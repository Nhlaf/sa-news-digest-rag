type QueryFormProps = {
  query: string;
  location: string;
  maxItems: number;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onMaxItemsChange: (value: number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function QueryForm({
  query,
  location,
  maxItems,
  loading,
  onQueryChange,
  onLocationChange,
  onMaxItemsChange,
  onSubmit,
}: QueryFormProps) {
  return (
    <section className="panel">
      <form onSubmit={onSubmit} className="query-form">
        <div className="field-group">
          <label htmlFor="query">Ask about the news</label>
          <textarea
            id="query"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            rows={3}
            placeholder="Summarise South African technology news from yesterday"
            minLength={3}
            required
          />
        </div>

        <div className="form-row">
          <div className="field-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) => onLocationChange(event.target.value)}
              placeholder="South Africa"
            />
          </div>

          <div className="field-group small-field">
            <label htmlFor="maxItems">Maximum articles</label>
            <input
              id="maxItems"
              type="number"
              min={1}
              max={50}
              value={maxItems}
              onChange={(event) => onMaxItemsChange(Number(event.target.value) || 2)}
            />
          </div>
        </div>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search News'}
        </button>
      </form>
    </section>
  );
}
