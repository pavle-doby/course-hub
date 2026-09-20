import { db, schema } from "@repo/db";
import { UserEntity } from "@repo/db-schema";
import type { CreateUser } from "./types";
import { eq } from "drizzle-orm";

export const authRepository = {
  getUserByAuthUserId: async (authUserId: string): Promise<UserEntity | undefined> => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authUserId, authUserId));
    return user;
  },
  createUser: async (body: CreateUser): Promise<UserEntity> => {
    const [newUser] = await db.insert(schema.users).values(body).returning();
    return newUser!;
  },
};
