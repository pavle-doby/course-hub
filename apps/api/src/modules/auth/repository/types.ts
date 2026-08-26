import type { UserEntity } from "@repo/db-schema";

export type CreateUser = Pick<
  UserEntity,
  "authUserId" | "email" | "firstName" | "lastName" | "username" | "role"
>;
