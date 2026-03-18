import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

export const env = process.env as {
  DATABASE_URL: string;
};
