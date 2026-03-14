import z from "zod";
import { registry } from "./registry";
import { PaginationSchema, UserSchema as UserSchemaBase } from "@repo/contract";

export const UserSchema = registry.register("User", UserSchemaBase);

export const PaginatedUsersSchema = registry.register(
  "Users",
  z.object({
    data: z.array(UserSchema),
    pagination: PaginationSchema,
  }),
);
