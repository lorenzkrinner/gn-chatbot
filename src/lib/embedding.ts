import fs from "fs";
import { openai } from "../config.js";
import { supabase } from "../config.js";

const FILE_PATH = "../../data/raw_transcripts.txt";
const FILE_NAME = "raw-transcripts.txt";
const CHUNK_CHAR_LENGTH = 1000;

(async () => {
  const text = fs.readFileSync(FILE_PATH, "utf8");
  const chunks = splitIntoChunks(text, CHUNK_CHAR_LENGTH);

  console.log(`Loaded "${FILE_NAME}" into ${chunks.length} chunks`);

  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);

    const { error } = await supabase.from("documents").insert({
      file_name: FILE_NAME,
      content: chunk,
      embedding,
    });

    if (error) {
      console.error("Supabase insert error:", error.message)
    } else {
      console.log("Chunk stored");
    }
  }
})();

function splitIntoChunks(text: string, chunkSize: number) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current= "";

  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence + " ";
    }
  }
  if (current) chunks.push(current.trim());

  return chunks;
}

async function getEmbedding(text: string) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return res.data[0].embedding;
}