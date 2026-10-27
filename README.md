# SA News Digest RAG

An AI-powered news digest for South African news. The project includes a TypeScript API that ingests articles, stores searchable text and embeddings in MongoDB Atlas, and answers natural-language questions with source articles. A React frontend provides a browser interface for checking service health, triggering ingestion, and querying news.

## Features

- Ingest articles from configurable news publisher pages.
- Extract and clean article content with Cheerio, with an optional Playwright fallback for JavaScript-rendered pages.
- Split article text into chunks and create Mistral embeddings.
- Store articles and chunks in MongoDB Atlas.
- Retrieve relevant content using Atlas Search keyword retrieval and Atlas Vector Search semantic retrieval.
- Generate grounded digests using Groq and return the supporting articles.
- Search in keyword-only mode when embeddings are unavailable.

## Architecture

```text
News publisher pages
        |
        v
Cheerio extraction (optional Playwright fallback)
        |
        v
Text chunking -> Mistral embeddings -> MongoDB Atlas
                                      |
User question -> Atlas Search + Atlas Vector Search
                                      |
                                      v
                              Groq digest + sources
                                      |
                                      v
                              React web interface
```

## Prerequisites

- Node.js and npm
- MongoDB Atlas database with Search and Vector Search indexes configured
- Mistral API key for embeddings, unless using keyword-only mode
- Groq API key for digest generation

## Setup

### API

From the project root:

```bash
npm install
```

Copy `.env.example` to `.env` and set your own credentials and news source URLs. Do not commit `.env` or paste API keys into source files.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Configure at least one comma-separated publisher page in `NEWS_SOURCE_URLS`. Then start the API:

```bash
npm run dev
```

The API listens on `http://localhost:3000` by default.

### Frontend

In another terminal:

```bash
cd news-digest-frontend
npm install
npm run dev
```

The Vite development server prints the local frontend URL. The frontend calls `http://localhost:3000` by default. To use a different API URL, set `VITE_API_BASE_URL` in the frontend environment.

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | API port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017` |
| `MONGODB_DATABASE` | Database name | `news_rag_db` |
| `MISTRAL_API_KEY` | Mistral key used to create embeddings | unset |
| `MISTRAL_EMBEDDING_MODEL` | Embedding model | `mistral-embed` |
| `GROQ_API_KEY` | Groq key used to generate digests | unset |
| `GROQ_CHAT_MODEL` | Chat model | `openai/gpt-oss-120b` |
| `NEWS_SOURCE_URLS` | Comma-separated news listing URLs; at least one is required | none |
| `NEWS_REQUEST_TIMEOUT_MS` | Request timeout for publisher pages | `15000` |
| `NEWS_MAX_ARTICLES_PER_SOURCE` | Maximum articles to process per source | `20` |
| `NEWS_CHUNK_SIZE` | Target text chunk size | `800` |
| `NEWS_CHUNK_OVERLAP` | Text overlap between chunks | `120` |
| `KEYWORD_ONLY_MODE` | Disable vector retrieval when `true` | `false` |
| `PLAYWRIGHT_FALLBACK` | Enable browser-based extraction fallback | `false` |

When enabling the Playwright fallback, install its Chromium browser:

```bash
npx playwright install chromium
```

## MongoDB Atlas indexes

Create the following indexes on the `news_articles` collection:

### Atlas Search

Create a Search index named `news_text_search` for:

- `title`
- `location_hint`
- `chunks.text`

### Atlas Vector Search

Create a Vector Search index named `news_vector_index` with:

- Field path: `chunks.embedding`
- Dimensions: `1024`
- Similarity: `cosine`

The service creates the unique article URL index automatically.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Check API health |
| `POST` | `/ingest/run` | Ingest configured publisher sources |
| `POST` | `/news/query` | Generate a news digest |

Example ingestion request:

```json
{
  "sourceIds": ["news24-south-africa"]
}
```

`sourceIds` is optional; omit it to ingest all configured sources.

Example digest request:

```json
{
  "query": "Summarise South African technology news from yesterday",
  "location": "South Africa",
  "maxItems": 8
}
```

The query can also include optional `fromDate`, `toDate`, and `topic` fields. `maxItems` must be between 1 and 50.

Run ingestion from the command line with:

```bash
npm run ingest
```

## Development checks

Run the API TypeScript check and tests:

```bash
npm run build
npm test
```

Run frontend checks from `news-digest-frontend`:

```bash
npm run build
npm test
npm run lint
```
