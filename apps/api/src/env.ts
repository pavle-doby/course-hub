import dotenv from "dotenv";

dotenv.config({ path: [".env", ".env.local"] });

export const env = process.env as {
  SERVER_PORT: string;
  SUPABASE_URL: string;
  SUPABASE_API_KEY: string;
  DATABASE_URL: string;
  CORS_ENABLED_URL: string;
  NODE_ENV: "development" | "production" | "test";
  MIN_LOG_LEVEL: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_STREAM_API_TOKEN: string;
  CLOUDFLARE_STREAM_CUSTOMER_CODE: string;
  CLOUDFLARE_STREAM_WEBHOOK_SECRET: string;
  CLOUDFLARE_R2_ACCESS_KEY_ID: string;
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: string;
  CLOUDFLARE_R2_BUCKET: string;
  CLOUDFLARE_R2_ENDPOINT: string;
  CLOUDFLARE_R2_PUBLIC_URL: string;
};
