import { z } from "zod";
import { ApiTokenSchema, CreateApiTokenBodySchema, CreateApiTokenResponseSchema } from "./schemas";

export type ApiToken = z.infer<typeof ApiTokenSchema>;

// GET /api-tokens → active tokens of the current user
export type GetApiTokensRes = ApiToken[];

// POST /api-tokens → create a token, plaintext returned once
export type CreateApiTokenReq = z.infer<typeof CreateApiTokenBodySchema>;
export type CreateApiTokenRes = z.infer<typeof CreateApiTokenResponseSchema>;
