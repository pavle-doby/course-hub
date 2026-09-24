import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { apiTokens, apiTokenSourceEnum } from "@repo/db-schema";

// Never exposes tokenHash
export const ApiTokenSchema = createSelectSchema(apiTokens, {
  source: z.enum(apiTokenSourceEnum.enumValues),
}).pick({
  id: true,
  name: true,
  tokenPrefix: true,
  source: true,
  lastUsedAt: true,
  createdAt: true,
});

export const CreateApiTokenBodySchema = createInsertSchema(apiTokens, {
  name: (schema) => schema.trim().min(1),
}).pick({ name: true });

// Plaintext `token` is returned only once, at creation
export const CreateApiTokenResponseSchema = ApiTokenSchema.extend({ token: z.string() });
