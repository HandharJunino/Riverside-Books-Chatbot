# Riverside Books Chatbot

A small command-line FAQ chatbot for Riverside Books. It answers user questions by matching them against a local FAQ dataset.

## How to Run

Install dependencies:

```powershell
npm install
```

Start the bot:

```powershell
npm start
```

The app uses `@xenova/transformers` to load an embedding model. On the first run, it may need to download the model from Hugging Face. The `npm start` script uses `node --use-system-ca` to help avoid local certificate verification issues during that download.

## Matching Approach

The bot uses semantic embeddings with cosine similarity. Each FAQ question is converted into an embedding using the `Xenova/all-MiniLM-L6-v2` feature extraction model. When a user asks a question, the bot creates an embedding for that question and compares it against the stored FAQ embeddings.

I chose this approach as a middle ground between fuzzy matching and a full LLM. Fuzzy matching is fast and simple, but it mostly compares spelling or word overlap, so it can miss questions that use different wording. Semantic embeddings are better for this FAQ use case because they compare the meaning of the question instead. A full LLM could give more conversational answers, but it would add more cost, complexity, and risk of inventing information and hallucinations. And for a small fixed FAQ set, embeddings give the better benefit with none of those costs.

## No Good Answer Handling

The bot uses a similarity threshold to decide whether the best match is good enough. If the highest similarity score is below the threshold, it does not guess. Instead, it tells the user that it does not know the answer and suggests asking a member of staff or checking the website.

This reduces the chance of giving an incorrect answer when the user's question is outside the FAQ data as a false negative would be better than a false positive so as not to give out misinformation.

## Tradeoffs

Compared with fuzzy matching, semantic embeddings are usually more accurate when the user asks the same thing in a different way. Keyword matching fails on the exact case the task calls out like "when can I come in?" shares zero words with "opening hours" but means the same thing. Fuzzy matching helps with typos/word-order but not synonyms or paraphrasing. The tradeoff is that the first run can be slower because the model may need to download and load. Each question also requires embedding work, so it is slower than simple string or fuzzy matching.

Compared with an LLM, this approach is cheaper and more predictable because the model runs locally and does not require a paid API key. Hallucination risk is also lower because the bot only returns answers from the FAQ data instead of generating new answers. The tradeoff is that it is less flexible than an LLM: it cannot explain, reason, or answer questions beyond the FAQ content. An LLM would likely be more accurate on ambiguous cases and could reason about intent. Accuracy still depends on the quality and coverage of the FAQ entries, and the threshold may need tuning to avoid false matches or missed answers.

With more time, I would cache the FAQ embeddings so they do not need to be recomputed every time the bot starts. I would also add tests for common questions, tune the similarity threshold using real examples, and add a clearer setup for downloading or bundling the model for offline use. Also building a UI for easy usability and access.
