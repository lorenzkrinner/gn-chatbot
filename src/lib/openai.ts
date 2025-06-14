import { getInstructions } from "./instructions.js";
import { getChunks, retrievePreviousMessages } from "./supabase.js";
import { openai } from "../config.js";
import { instructions } from "./instructions.js";
import fs from "fs";

export async function returnEmbedding(message: string) {
  if (!message || typeof message !== "string") {
    console.error("Invalid message for embedding: ", message);
  }

  const embeddedQuery = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
  return embeddedQuery.data[0].embedding;
}


export async function getOpenAIResponse(phone: string, message: string) {
  const count = 10
  console.log("Instructions retrieved");
  const embeddedQuery = await returnEmbedding(message);
  console.log("Embedding retrieved");
  const chunks = await getChunks(embeddedQuery);
  console.log("Retrieved chunks");
  const previousMessages = await retrievePreviousMessages(phone, count);
  console.log("Previous messages retrieved");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: `Excerpts:\n${
            Array.isArray(chunks)
              ? chunks.map((c, i) => `(${i + 1}) ${c.content}`).join("\n\n")
              : "No relevant content found"
          }\n\nPrevious messages of user for your reference: ${previousMessages}\n\nQuestion of user: ${message}`,
        },
      ],
    });
    const message_content = response.choices[0].message.content
    console.log("Message generated");
    return message_content as string;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Sorry, but we encountered a server issue, please try again.";
  }
}