import { describe, expect, it } from "vitest";
import { cleanText, splitText } from "../src/utils/text.js";

describe("text utilities", () => {
  it("cleans whitespace", () => expect(cleanText("  South\n Africa  news ")).toBe("South Africa news"));
  it("splits text with overlap", () => {
    const chunks = splitText("abcdefghij", 6, 2);
    expect(chunks).toEqual(["abcdef", "efghij"]);
  });
});