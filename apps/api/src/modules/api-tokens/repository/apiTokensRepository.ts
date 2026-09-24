import { and, desc, eq, isNull } from "drizzle-orm";
import { db, schema } from "@repo/db";
import type { ApiToken } from "@repo/contract";

const apiTokenColumns = {
  id: schema.apiTokens.id,
  name: schema.apiTokens.name,
  tokenPrefix: schema.apiTokens.tokenPrefix,
  source: schema.apiTokens.source,
  lastUsedAt: schema.apiTokens.lastUsedAt,
  createdAt: schema.apiTokens.createdAt,
};

type ActiveApiToken = {
  id: string;
  userId: string;
  authUserId: string;
  lastUsedAt: Date | null;
};

export const apiTokensRepository = {
  getActiveTokens: async (userId: string): Promise<ApiToken[]> => {
    return await db
      .select(apiTokenColumns)
      .from(schema.apiTokens)
      .where(and(eq(schema.apiTokens.userId, userId), isNull(schema.apiTokens.revokedAt)))
      .orderBy(desc(schema.apiTokens.createdAt));
  },

  getActiveTokenByHash: async (tokenHash: string): Promise<ActiveApiToken | undefined> => {
    const [token] = await db
      .select({
        id: schema.apiTokens.id,
        userId: schema.apiTokens.userId,
        authUserId: schema.users.authUserId,
        lastUsedAt: schema.apiTokens.lastUsedAt,
      })
      .from(schema.apiTokens)
      .innerJoin(schema.users, eq(schema.apiTokens.userId, schema.users.id))
      .where(and(eq(schema.apiTokens.tokenHash, tokenHash), isNull(schema.apiTokens.revokedAt)));
    return token;
  },

  createToken: async (data: {
    userId: string;
    name: string;
    tokenHash: string;
    tokenPrefix: string;
    source?: ApiToken["source"];
  }): Promise<ApiToken> => {
    const [token] = await db.insert(schema.apiTokens).values(data).returning(apiTokenColumns);
    return token!;
  },

  revokeToken: async (id: string, userId: string): Promise<ApiToken | undefined> => {
    const [token] = await db
      .update(schema.apiTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(schema.apiTokens.id, id),
          eq(schema.apiTokens.userId, userId),
          isNull(schema.apiTokens.revokedAt)
        )
      )
      .returning(apiTokenColumns);
    return token;
  },

  setLastUsedAt: async (id: string): Promise<void> => {
    await db
      .update(schema.apiTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(schema.apiTokens.id, id));
  },
};
