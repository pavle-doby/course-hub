import { z } from "zod";
import { OauthApproveBodySchema, OauthApproveResponseSchema } from "./schemas";

// POST /oauth/approve → where to send the browser back to the OAuth client
export type OauthApproveReq = z.infer<typeof OauthApproveBodySchema>;
export type OauthApproveRes = z.infer<typeof OauthApproveResponseSchema>;
