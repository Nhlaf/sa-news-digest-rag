# Runtime Verification Steps

## Prerequisites
1. Add GROQ_API_KEY to .env
2. Ensure MongoDB Atlas indexes are created

## Test Sequence

### 1. Start Backend
```bash
npm run dev
```

### 2. Health Check
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok","service":"news-digest-rag-agent"}`

### 3. Run Ingestion (Mistral Embeddings)
```bash
curl -X POST http://localhost:3000/ingest/run \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected:
- `sourcesProcessed > 0`
- `articlesStored > 0`
- Articles have 1024-dimensional embeddings

### 4. Test Query (Groq Digest)
```bash
curl -X POST http://localhost:3000/news/query \
  -H "Content-Type: application/json" \
  -d '{"query":"Summarise South African technology news","location":"South Africa","maxItems":5}'
```

Expected:
```json
{
  "answer": "...",
  "articles": [...]
}
```

### 5. Verify Provider Separation
- Ingestion uses Mistral for embeddings only
- Query uses Mistral for query embeddings
- Digest uses Groq only (no Mistral chat model)

### 6. MongoDB Atlas Indexes Required
Manual verification needed:
1. Log into MongoDB Atlas
2. Go to `news_rag_db.news_articles` collection
3. Create `news_text_search` (Atlas Search)
4. Create `news_vector_index` (Atlas Vector Search, 1024 dimensions)

### 7. Frontend Test
1. Start frontend: `cd news-digest-frontend && npm run dev`
2. Open http://localhost:5173
3. Enter query: "Summarise South African technology news"
4. Verify digest displays
