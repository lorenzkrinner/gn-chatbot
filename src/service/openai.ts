import OpenAI from "openai";
import { openaiApiKey } from "../config.js";

const openai = new OpenAI({ apiKey: openaiApiKey });

async function generateAIResponse(senderNumber: string, message: string) {
  const instructions: string = "Ignore this for now";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: `Excerpts:\n`
        }
      ]
    })
  }
}