import { db, schema } from '@my/db';
import type { CreateUser } from './types';
import { eq } from 'drizzle-orm';

export const authRepository = {
  getUserByEmail: async (email: string) => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return user;
  },
  createUser: async (body: CreateUser) => {
    const [newUser] = await db.insert(schema.users).values(body).returning();
    return newUser;
  },
};
