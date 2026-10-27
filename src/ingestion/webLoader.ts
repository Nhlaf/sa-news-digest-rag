import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { load as parseHtml } from "cheerio";
import { env } from "../config/env.js";
import { cleanText, parseDate } from "../utils/text.js";
import type { NewsSource } from "../config/newsSources.js";

export type ExtractedArticle = {
  url: string;
  title: string;
  content: string;
  publishedAt: Date | null;
};

function absoluteUrl(sourceUrl: string, href: string): string | null {
  try {
    const url = new URL(href, sourceUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function loadHtml(url: string): Promise<string> {
  try {
    const loader = new CheerioWebBaseLoader(url, { selector: "body" });
    await loader.load();
    const response = await fetch(url, { signal: AbortSignal.timeout(env.NEWS_REQUEST_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    if (!env.PLAYWRIGHT_FALLBACK) throw error;
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: env.NEWS_REQUEST_TIMEOUT_MS });
      return await page.content();
    } finally {
      await browser.close();
    }
  }
}

export async function discoverArticleUrls(source: NewsSource): Promise<string[]> {
  const html = await loadHtml(source.url);
  const links = [...html.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => match[1] ? absoluteUrl(source.url, match[1]) : null)
    .filter((url): url is string => Boolean(url));
  const sourceHost = new URL(source.url).hostname.replace(/^www\./, "");
  return [...new Set(links)].filter((url) => {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "") === sourceHost && parsed.pathname !== new URL(source.url).pathname;
  });
}

export async function extractArticle(url: string, source: NewsSource): Promise<ExtractedArticle | null> {
  const html = await loadHtml(url);
  const $ = parseHtml(html);
  $("script, style, noscript, nav, header, footer, aside, form, iframe, dialog, [role='banner'], [role='navigation'], [role='complementary'], [class*='ad-'], [class*='advert'], [id*='ad-'], [id*='advert']").remove();
  const titleElement = $(source.titleSelector ?? "meta[property='og:title'], h1, title").first();
  const title = cleanText(titleElement.attr("content") ?? titleElement.text()).replace(/\s*[|:-].*$/, "");
  const dateElement = $(source.publishedAtSelector ?? "meta[property='article:published_time'], time").first();
  const publishedValue = dateElement.attr("content") ?? dateElement.attr("datetime") ?? dateElement.text();
  const contentRoot = $(source.contentSelector ?? "article, main, [role='main']").first();
  const body = cleanText((contentRoot.length ? contentRoot.text() : $("body").text()));
  if (!title || body.length < 160) return null;
  return { url, title, content: body, publishedAt: parseDate(publishedValue) };
}