import twilio from "twilio";
import { accountSid, twilioAuthToken } from "../config.js";

const client = twilio(accountSid, twilioAuthToken);

const sender = process.env.TWILIO_SENDER;

export async function sendResponse(to: string, message: string) {
  try {
    const { errorCode, body, errorMessage } = await client.messages.create({
      body: message,
      from: `whatsapp:+${sender}`,
      to: `whatsapp:+${to}`
    });

    if (errorCode && errorMessage) console.log(errorCode, errorMessage);

    return;
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: error },
      { status: 500 }
    )
  }
}