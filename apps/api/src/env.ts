import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

export const env = process.env as {
  SERVER_PORT: string;
  SUPABASE_URL: string;
  SUPABASE_API_KEY: string;
  DATABASE_URL: string;
  CORS_ENABLED_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  MIN_LOG_LEVEL: string;
};
