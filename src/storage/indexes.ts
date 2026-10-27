export const atlasSearchIndex = {
  name: "news_text_search",
  definition: {
    mappings: { dynamic: false, fields: {
      title: { type: "string" },
      location_hint: { type: "string" },
      chunks: { type: "document", fields: { text: { type: "string" } } }
    } }
  }
};

export const atlasVectorIndex = {
  name: "news_vector_index",
  definition: {
    fields: [{ path: "chunks.embedding", numDimensions: 1024, similarity: "cosine", type: "vector" }]
  }
};