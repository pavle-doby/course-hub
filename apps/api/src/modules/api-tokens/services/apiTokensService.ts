import { createHash, randomBytes } from "node:crypto";
import {
  ErrorCodeApiToken,
  ErrorCodeUser,
  NotFoundError,
  type ApiToken,
  type CreateApiTokenReq,
  type CreateApiTokenRes,
  type GetApiTokensRes,
} from "@repo/contract";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { apiTokensRepository } from "../repository/apiTokensRepository";

const TOKEN_PREFIX = "ch_pat_";
const PREFIX_DISPLAY_LENGTH = 12;
const LAST_USED_THROTTLE_MS = 60_000;

// SHA-256 (not bcrypt) is fine: tokens are 32 random bytes, and hash lookup stays O(1)
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function getUserId(authUserId: string): Promise<string> {
  const user = await usersRepository.getUserByAuthUserId(authUserId);
  if (!user) {
    throw new NotFoundError({ code: ErrorCodeUser.NOT_FOUND });
  }
  return user.id;
}

export const apiTokensService = {
  getTokens: async (authUserId: string): Promise<GetApiTokensRes> => {
    return await apiTokensRepository.getActiveTokens(await getUserId(authUserId));
  },

  createToken: async (
    authUserId: string,
    dto: CreateApiTokenReq,
    source: ApiToken["source"] = "manual"
  ): Promise<CreateApiTokenRes> => {
    const token = `${TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
    const created = await apiTokensRepository.createToken({
      userId: await getUserId(authUserId),
      name: dto.name,
      tokenHash: hashToken(token),
      tokenPrefix: token.slice(0, PREFIX_DISPLAY_LENGTH),
      source,
    });
    return { ...created, token };
  },

  revokeToken: async (id: string, authUserId: string): Promise<void> => {
    const revoked = await apiTokensRepository.revokeToken(id, await getUserId(authUserId));
    if (!revoked) {
      throw new NotFoundError({ code: ErrorCodeApiToken.NOT_FOUND });
    }
  },

  // Returns the owner of an active token, or undefined
  authenticate: async (
    token: string
  ): Promise<{ userId: string; authUserId: string } | undefined> => {
    if (!token.startsWith(TOKEN_PREFIX)) {
      return undefined;
    }
    const row = await apiTokensRepository.getActiveTokenByHash(hashToken(token));
    if (!row) {
      return undefined;
    }
    // ponytail: fire-and-forget, throttled to once per minute per token
    if (!row.lastUsedAt || Date.now() - row.lastUsedAt.getTime() > LAST_USED_THROTTLE_MS) {
      void apiTokensRepository.setLastUsedAt(row.id).catch(() => undefined);
    }
    return { userId: row.userId, authUserId: row.authUserId };
  },
};
