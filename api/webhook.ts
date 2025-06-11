import { config as dotenvConfig } from "dotenv";
import { twilioResponse } from "../src/types.js";

dotenvConfig();

import { sendResponse } from "../src/lib/twilio.js";
import { storeMessage } from "../src/lib/supabase.js";
import { saveNewUser, updateUser } from "../src/lib/auth.js";
import { getOpenAIResponse } from "../src/lib/openai.js";
import { Request, Response } from "express";


export async function GET(req: Request, res: Response) {
  console.log("GET /webhook");
  res.status(200).json({ success: true });
  return;
};

export async function POST(req: Request, res: Response) {
  console.log("POST /webhook");
  res.status(200)
  

  try {
    const body: twilioResponse = req.body;

    if (!body?.From || !body.Body) {
      console.error("Missing required fields in webhook body");
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const senderNumber: string = body?.From.split(":", 2)[1]?.split("+", 2)[1];
    const senderName: string = body.ProfileName || "Unknown";
    const message: string = body.Body;

    if (!senderNumber) {
      console.error("Could not extract sender number from:", body.From);
      res.status(400).json({ error: "Invalid sender number format" });
      return;
    }

    console.log(`Processing message from ${senderNumber}: ${message}`);

    await storeMessage(senderNumber, message);
    console.log("Message stored successfully");

    await saveNewUser(senderNumber, senderName);
    console.log("User saved/updated successfully");

    const aiResponse: string = await getOpenAIResponse(senderNumber, message);
    console.log("AI response generated:", aiResponse);

    await sendResponse(senderNumber, aiResponse);
    console.log("Response sent successfully");

    await updateUser(senderNumber);
    console.log("User updated successfully");

    res.status(200).json({ message: "Response successfully sent" });
    return;
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};