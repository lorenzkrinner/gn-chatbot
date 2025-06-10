import { supabase } from "../config.js";

export async function getChunks(queryEmbedding: number[]) {
  const { data: chunks, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: 0.8,
      match_count: 6
    });

    if (error) {
      console.error("Supabase vector search error:", error.message);
      return Response.json(
        { message: error },
        { status: 500 }
      );
    }
    
    console.log("Chunks retrieved: ", chunks);
    Response.json(
      { message: `Chunks retrieved: ${chunks}`},
      { status: 200 }
    );
    return chunks;
}

export async function saveMessage(phone: string, text: string) {
  return await supabase.from("messages").insert([{ 
    phone_number: phone, 
    content: text 
  }]);
}

export async function retrievePreviousMessages(phone: string, count: number) {
  const response = await supabase
    .from("messages")
    .select("content")
    .eq("user_phone", phone)
    .order("sent_at", { ascending: false })
    .limit(count);
  if (!response.data) {
    console.log("No previous messages detected.");
    return null
  }
  const messages = response.data.map((row, i) => `(${i + 1}) ${row.content}`).join("/n")
  console.log(`Previous messages retrieved: ${messages}`);
  return messages;
}

export async function storeMessage(phone: string, message: string) {
  const response = supabase.from("messages").insert({
    "user_phone": phone,
    "content": message
  })
  return response;
}