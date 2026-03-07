import type { UserEntity } from '@repo/db-schema';

export type CreateUser = Pick<
  UserEntity,
  'firstName' | 'lastName' | 'email' | 'role' | 'status'
>;
