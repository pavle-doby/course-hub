import type { UserEntity, UserPreferencesEntity } from "@repo/db-schema";

export type CreateUser = Pick<
  UserEntity,
  "authUserId" | "email" | "firstName" | "lastName" | "username" | "role"
>;

export type CreateUserPreferences = Pick<UserPreferencesEntity, "language" | "theme">;
