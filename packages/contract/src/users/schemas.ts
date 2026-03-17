import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { z } from 'zod'
import { users } from '@my/db-schema'
import { userRoleEnum, userStatusEnum } from '@my/db-schema'

export const UserSchema = createSelectSchema(users).omit({
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
})

export const UserGetAllQuerySchema = createSelectSchema(users, {
  role: z.enum(userRoleEnum.enumValues).optional(),
  status: z.enum(userStatusEnum.enumValues).optional(),
})
  .pick({ status: true, role: true })
  .partial()

export const UserPostQuerySchema = createInsertSchema(users, {
  email: z.email(),
  role: z.enum(userRoleEnum.enumValues).optional(),
  status: z.enum(userStatusEnum.enumValues).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
})

export const UserPutQuerySchema = createUpdateSchema(users, {
  email: z.email(),
  role: z.enum(userRoleEnum.enumValues).optional(),
  status: z.enum(userStatusEnum.enumValues).optional(),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastLogin: true,
  })
  .partial()
