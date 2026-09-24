import { ErrorCodeOauth } from "@repo/contract";

export const oauthErrorMessages = {
  [ErrorCodeOauth.INVALID_CLIENT]: {
    title: "errors.oauth.INVALID_CLIENT.title",
    message: "errors.oauth.INVALID_CLIENT.message",
  },
} as const satisfies Record<ErrorCodeOauth, { title: string; message: string }>;
