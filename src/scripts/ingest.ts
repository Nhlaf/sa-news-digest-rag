import { configuredSources } from "../config/env.js";
import { closeDatabase } from "../storage/mongo.js";
import { ingestSources } from "../ingestion/ingestService.js";

try {
  console.log(await ingestSources(configuredSources()));
} finally {
  await closeDatabase();
}