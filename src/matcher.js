import { pipeline, env } from "@xenova/transformers";

env.localModelPath = "./models/";

export class FAQMatcher {
  constructor(faqs) {
    this.faqs = faqs;
    this.embedder = null;
    this.faqEmbeddings = [];
    this.SIMILARITY_THRESHOLD = 0.55;
  }

  async initialize() {
    console.log("Loading the embedding model ...");

    // Load the model
    this.embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );

    console.log("Computing the embeddings for FAQs");
    for (const faq of this.faqs) {
      const embedding = await this.getEmbedding(faq.question);
      this.faqEmbeddings.push(embedding);
    }

    console.log(
      `Loaded ${this.faqs.length} FAQs. Threshold: ${this.SIMILARITY_THRESHOLD}\n`,
    );
  }

  async getEmbedding(text) {
    const result = await this.embedder(text, {
      pooling: "mean",
      normalize: true, // Normalising for cosine similarity
    });
    return Array.from(result.data);
  }

  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async findBestMatch(question) {
    const questionEmbedding = await this.getEmbedding(question);

    let bestSimilarity = -1;
    let bestIndex = -1;

    for (let i = 0; i < this.faqEmbeddings.length; i++) {
      const similarity = this.cosineSimilarity(
        questionEmbedding,
        this.faqEmbeddings[i],
      );
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestIndex = i;
      }
    }

    const isMatch = bestSimilarity >= this.SIMILARITY_THRESHOLD;

    return {
      faq: isMatch ? this.faqs[bestIndex] : null,
      similarity: bestSimilarity,
      isMatch,
    };
  }
}
