import express, { Request, Response, type Router } from "express";
import { sendResponse } from "../lib/twilio.js";
import { storeMessage } from "../lib/supabase.js";
import { saveNewUser, updateUser } from "../lib/auth.js";
import { getOpenAIResponse } from "../lib/openai.js";

const router = express.Router();

export const webhookVerifier: Router = router.get("/", (req: Request, res: Response) => {
  console.log(req.body);
  // Verification if necessary
});

export const webhookHandler: Router = router.post("/", async(req: Request, res: Response) => {
  const body = req.body;

  const senderNumber: string = body.From.split(":", 2)[1].split("+", 2)[1];
  const senderName: string = body.ProfileName;
  const message : string = body.Body;

  await storeMessage(senderNumber, message);

  // showTypingIndicator(message.id);

  await saveNewUser(senderNumber, senderName);
  const aiResponse: string = await getOpenAIResponse(senderNumber, message);
  await sendResponse(senderNumber, aiResponse);
  await updateUser(senderNumber);

  res.sendStatus(200);
})