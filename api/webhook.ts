import express, { type Response, type Request, type NextFunction } from "express";
import serverless from "serverless-http";

import { sendResponse } from "../src/lib/twilio.js";
import { storeMessage } from "../src/lib/supabase.js";
import { saveNewUser, updateUser } from "../src/lib/auth.js";
import { getOpenAIResponse } from "../src/lib/openai.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log("Middleware start!");

app.use("/", (req, res, next) => {
  console.log("Request body:", req.body);
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  console.log("GET /webhook fired");
  res.status(200).send("Webhook verifier OK");
  return;
});

app.post("/", async (req: Request, res: Response) => {
  console.log("POST /webhook fired.");
  
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

app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

const handler = serverless(app);
export default handler;