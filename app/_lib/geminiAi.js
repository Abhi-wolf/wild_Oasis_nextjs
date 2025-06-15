import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) throw new Error("Gemini api key not found");

const genAI = new GoogleGenerativeAI(apiKey);

export async function getEmbeddings(text) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const result = await model.embedContent(text);
  const embedding = result.embedding;

  return embedding.values;
}
