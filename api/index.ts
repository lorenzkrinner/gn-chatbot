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

export default app;