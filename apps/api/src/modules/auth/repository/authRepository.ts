import { db, schema } from "@repo/db";
import type { CreateUser } from "./types";
import { eq } from "drizzle-orm";

export const authRepository = {
  getUserByAuthUserId: async (authUserId: string) => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authUserId, authUserId));
    return user;
  },
  createUser: async (body: CreateUser) => {
    const [newUser] = await db.insert(schema.users).values(body).returning();
    return newUser;
  },
};
