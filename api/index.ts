import express, { type Response, type Request, type NextFunction } from "express";
import cors from "cors";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const isDevelopment = false;

import { sendResponse } from "../src/lib/twilio.js";
import { storeMessage } from "../src/lib/supabase.js";
import { saveNewUser, updateUser } from "../src/lib/auth.js";
import { getOpenAIResponse } from "../src/lib/openai.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:4000", 
    "https://gn-chatbot.vercel.app",
    "https://gn-chatbot.vercel.app/"
  ]
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.method === 'POST') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.get("/", async (req, res) => {
  console.log("GET /");
  res.status(200).json({ message: "Growth Nation's Chatbot" });
});

app.get("/api", async (req, res) => {
  console.log("GET /api");
  res.status(200).json({ message: "Growth Nation's Chatbot API" });
});

app.get("/webhook", async (req: Request, res: Response) => {
  console.log("GET /webhook");
  res.status(200).json({ success: true });
});

app.get("/api/webhook", async (req: Request, res: Response) => {
  console.log("GET /api/webhook");
  res.status(200).json({ success: true });
});

app.post("/webhook", async (req: Request, res: Response) => {
  console.log("POST /webhook - Original route");
  await handleWebhook(req, res);
});

app.post("/api/webhook", async (req: Request, res: Response) => {
  console.log("POST /api/webhook - API route");
  await handleWebhook(req, res);
});

async function handleWebhook(req: Request, res: Response) {
  console.log("Processing webhook...");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  
  try {
    const body = req.body;

    if (!body.From || !body.Body) {
      console.error("Missing required fields in webhook body");
      console.error("Available fields:", Object.keys(body));
      return res.status(400).json({ error: "Missing required fields" });
    }

    const senderNumber: string = body.From.split(":", 2)[1]?.split("+", 2)[1];
    const senderName: string = body.ProfileName || "Unknown";
    const message: string = body.Body;

    if (!senderNumber) {
      console.error("Could not extract sender number from:", body.From);
      return res.status(400).json({ error: "Invalid sender number format" });
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
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Webhook error:", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove app.listen() - Vercel handles this
// For local development, you can conditionally add it:
if (process.env.NODE_ENV !== 'production') {
  app.listen(4000, () => {
    console.log("Server ready on port 4000.");
  });
}

export default app;