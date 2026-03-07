import type { Config } from 'drizzle-kit';
import { env } from './src/env';

export default {
  schema: './src/schema.ts', // Point directly to db-schema
  out: './drizzle', // migrations output
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
