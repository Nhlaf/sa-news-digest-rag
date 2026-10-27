import { MongoClient, type Collection, type Db } from "mongodb";
import { env } from "../config/env.js";
import type { NewsArticle } from "../types.js";

let client: MongoClient | undefined;
let database: Db | undefined;

export async function getDatabase(): Promise<Db> {
  if (!database) {
    client = new MongoClient(env.MONGODB_URI);
    await client.connect();
    database = client.db(env.MONGODB_DATABASE);
    await database.collection<NewsArticle>("news_articles").createIndex({ "source.url": 1 }, { unique: true });
  }
  return database;
}

export async function getArticlesCollection(): Promise<Collection<NewsArticle>> {
  const db = await getDatabase();
  return db.collection<NewsArticle>("news_articles");
}

export async function closeDatabase(): Promise<void> {
  await client?.close();
  client = undefined;
  database = undefined;
}