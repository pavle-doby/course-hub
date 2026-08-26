import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "@repo/db-schema";
import { userRoleEnum } from "@repo/db-schema";

export const UserSchema = createSelectSchema(users, {
  role: z.enum(userRoleEnum.enumValues),
}).omit({
  authUserId: true,
  createdAt: true,
  updatedAt: true,
});

export const UserGetAllQuerySchema = createSelectSchema(users, {
  role: z.enum(userRoleEnum.enumValues).optional(),
})
  .pick({ role: true })
  .partial();

export const UserPostQuerySchema = createInsertSchema(users, {
  role: z.enum(userRoleEnum.enumValues).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UserPutQuerySchema = createUpdateSchema(users, {
  role: z.enum(userRoleEnum.enumValues).optional(),
})
  .omit({
    id: true,
    authUserId: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();
