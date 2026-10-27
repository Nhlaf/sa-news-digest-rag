import express from "express";
import cors from "cors";
import { z } from "zod";
import { configuredSources, env } from "./config/env.js";
import { ingestSources } from "./ingestion/ingestService.js";
import { answerDigest } from "./retrieval/digestService.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const querySchema = z.object({
  query: z.string().min(3),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  location: z.string().optional(),
  topic: z.string().optional(),
  maxItems: z.number().int().positive().max(50).default(2)
});

app.get("/health", (_request, response) => response.json({ status: "ok", service: "news-digest-rag-agent" }));

app.post("/ingest/run", async (request, response) => {
  try {
    const body = z.object({ sourceIds: z.array(z.string()).optional() }).parse(request.body ?? {});
    const sources = configuredSources().filter((source) => !body.sourceIds || body.sourceIds.includes(source.id));
    response.json(await ingestSources(sources));
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Ingestion failed" });
  }
});

app.post("/news/query", async (request, response) => {
  try {
    response.json(await answerDigest(querySchema.parse(request.body)));
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({ error: "Invalid query request. Check the query, dates, and maxItems (1-50)." });
      return;
    }
    const providerStatus = typeof error === "object" && error !== null
      ? "statusCode" in error
        ? error.statusCode
        : "status" in error
          ? error.status
          : undefined
      : undefined;
    const rateLimited = providerStatus === 429;
    const noCredits = error instanceof Error && /no credits|insufficient_quota|billing hard limit/i.test(error.message);
    console.error("News query failed:", error instanceof Error ? error.message : "Unknown error");
    response.status(rateLimited ? 429 : 500).json({
      error: rateLimited
        ? noCredits
          ? "The AI provider account has no available credits. Add credits or configure a provider with available quota."
          : "Digest generation is temporarily rate-limited. Please try again shortly."
        : "Unable to generate the news digest. Please try again."
    });
  }
});

export function startServer(): void {
  app.listen(env.PORT, () => console.log(`News Digest RAG Agent listening on http://localhost:${env.PORT}`));
}

export default app;