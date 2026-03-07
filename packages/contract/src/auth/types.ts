import type { UserEntity } from "@repo/db-schema";
import { User } from "../users";

export type SignUpUserReq = Pick<
  UserEntity,
  "firstName" | "lastName" | "email"
> & {
  password: string;
};
export type SignUpUserRes = User;

export type LogInUserReq = Pick<UserEntity, "email"> & { password: string };
export type LogInUserRes = User;
