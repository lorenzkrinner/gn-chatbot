import twilio from "twilio";

const accountSid: string | undefined = process.env.TWILIO_ACCOUNT_SID!;
const authToken: string | undefined = process.env.TWILIO_AUTH_TOKE;

const client = twilio(accountSid, authToken);

async function createMessage(sender: string, receiver: string) {
  const message = await client.messages.create({
    body: "Hello, there!",
    from: `whatsapp: ${sender}`,
    to: `whatsapp: ${receiver}`
  });

  console.log("Message sent: ", message.body);
}