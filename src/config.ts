import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";

const env_path = path.resolve(import.meta.dirname, "../.env.local");
dotenv.config({ path: env_path });

// Env variables
export const accountSid: string | undefined = process.env.TWILIO_ACCOUNT_SID;
export const twilioAuthToken: string | undefined = process.env.TWILIO_AUTH_TOKEN;


// Supabase
const supabaseUrl: string = process.env.SUPABASE_PROJECT_URL!;
const supabaseKey: string = process.env.SUPABASE_SERVICE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// OpenAI
const openaiApiKey: string | undefined = process.env.OPENAI_API_KEY;
export const openai = new OpenAI({ apiKey: openaiApiKey });