import express, { type Response, type Request, type NextFunction } from "express";
import cors from "cors";
import serverless from "serverless-http";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const isDevelopment = false;

import { sendResponse } from "../src/lib/twilio.js";
import { storeMessage } from "../src/lib/supabase.js";
import { saveNewUser, updateUser } from "../src/lib/auth.js";
import { getOpenAIResponse } from "../src/lib/openai.js";

export const app = express();

app.use(cors({
  origin: [
    "http://localhost:4000", 
    "https://gn-chatbot.vercel.app/"
  ]
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  console.log("GET /");
  res.status(200).json({ message: "Growth Nation's Chatbot" });
});

app.get("/webhook", async (req: Request, res: Response) => {
  console.log("GET /webhook");
  res.status(200).json({ success: true });
  return;
});

app.post("/webhook", async (req: Request, res: Response) => {
  console.log("POST /webhook");
  res.status(200).json({ message: "Webhook received " });

  try {
    const body = req.body;

    if (!body.From || !body.Body) {
      console.error("Missing required fields in webhook body");
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const senderNumber: string = body.From.split(":", 2)[1]?.split("+", 2)[1];
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
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Webhook error:", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(4000,() => {
  console.log("Server ready on port 4000.");
});

export default app;