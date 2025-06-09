import dotenv from "dotenv";
import path from "path";

const env_path = path.resolve(import.meta.dirname, "../.env.local");
dotenv.config({ path: env_path });

export const accountSid: string | undefined = process.env.TWILIO_ACCOUNT_SID;
export const twilioAuthToken: string | undefined = process.env.TWILIO_AUTH_TOKEN;
export const openaiApiKey: string | undefined = process.env.OPENAI_API_KEY;
export const supabaseUrl: string = process.env.SUPABASE_PROJECT_URL!;
export const supabaseKey: string = process.env.SUPABASE_SERVICE_KEY!;