import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { userPreferences, users } from "@repo/db-schema";
import { planEnum, userRoleEnum } from "@repo/db-schema";

export const UserSchema = createSelectSchema(users, {
  role: z.enum(userRoleEnum.enumValues),
  plan: z.enum(planEnum.enumValues),
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
  // Set only through `PUT /users/:id/plan` (later: the payment webhook)
  plan: true,
  planVersion: true,
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
    // Open to the user's own profile edit, so the plan must never be writable here
    plan: true,
    planVersion: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export const UserPreferencesSchema = createSelectSchema(userPreferences).pick({
  contentBehavior: true,
  theme: true,
  language: true,
});

export const UserPreferencesPutQuerySchema = UserPreferencesSchema;
