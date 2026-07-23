import dotenv from "dotenv";
import { z } from "zod";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(8, "JWT_ACCESS_SECRET must be at least 8 characters long"),
  JWT_REFRESH_SECRET: z.string().min(8, "JWT_REFRESH_SECRET must be at least 8 characters long"),
  ENCRYPTION_KEY: z.string().length(64, "ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  VEDAS_BASE_URL: z.string().url().default("https://vedas.sac.gov.in/api/v1"),
  VEDAS_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
