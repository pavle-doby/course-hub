import z from 'zod';
import { registry } from './registry';
import { PaginationSchema, UserSchema as UserSchemaBase } from '@my/contract';

export const UserSchema = registry.register('User', UserSchemaBase);

export const NativeAuthWithTokensSchema = registry.register(
  'NativeAuthWithTokens',
  z.object({
    user: UserSchemaBase,
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

export const NativeAuthTokensSchema = registry.register(
  'NativeAuthTokens',
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

export const PaginatedUsersSchema = registry.register(
  'Users',
  z.object({
    data: z.array(UserSchema),
    pagination: PaginationSchema,
  })
);
