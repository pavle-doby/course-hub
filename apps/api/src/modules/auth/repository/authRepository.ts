import { db, schema } from "@repo/db";
import { UserEntity, UserPreferencesEntity } from "@repo/db-schema";
import type { CreateUser, CreateUserPreferences } from "./types";
import { eq } from "drizzle-orm";

export const authRepository = {
  getUserByAuthUserId: async (authUserId: string): Promise<UserEntity | undefined> => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authUserId, authUserId));
    return user;
  },
  getUserPreferences: async (
    userId: string
  ): Promise<Pick<UserPreferencesEntity, "language" | "theme"> | undefined> => {
    const [preferences] = await db
      .select({ language: schema.userPreferences.language, theme: schema.userPreferences.theme })
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.userId, userId));
    return preferences;
  },
  createUser: async (user: CreateUser, preferences: CreateUserPreferences): Promise<UserEntity> => {
    return await db.transaction(async (tx) => {
      const [newUser] = await tx.insert(schema.users).values(user).returning();
      await tx.insert(schema.userPreferences).values({ userId: newUser!.id, ...preferences });
      return newUser!;
    });
  },
};
