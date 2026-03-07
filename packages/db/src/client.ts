import * as schema from "@repo/db-schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";

const connectionString = env.DATABASE_URL as string;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

// test db connection
console.log("Testing DB connection...");
const [dbConnected] = await client`SELECT version()`;
console.log(`[DB Connected]: ${dbConnected?.version}`);
