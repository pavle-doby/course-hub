import { z } from "zod";

// Consent screen answer: `approve: false` still returns a redirect (with `error=access_denied`)
export const OauthApproveBodySchema = z.object({
  clientId: z.string().min(1),
  redirectUri: z.url(),
  codeChallenge: z.string().min(43).max(128),
  state: z.string().optional(),
  approve: z.boolean(),
});

export const OauthApproveResponseSchema = z.object({ redirectUrl: z.string() });
