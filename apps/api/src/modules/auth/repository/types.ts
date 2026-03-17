import type { UserEntity } from '@my/db-schema';

export type CreateUser = Pick<
  UserEntity,
  'firstName' | 'lastName' | 'email' | 'role' | 'status'
>;
