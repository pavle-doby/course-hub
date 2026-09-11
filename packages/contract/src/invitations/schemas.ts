import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { courseInvitations } from "@repo/db-schema";
import { UserSchema } from "../users/schemas";

export const InvitationUserSchema = UserSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  avatarUrl: true,
  email: true,
});

export const CourseInvitationSchema = createSelectSchema(courseInvitations).extend({
  acceptedByUser: InvitationUserSchema.optional().nullable(),
  invitedUser: InvitationUserSchema.optional().nullable(),
});

export const CreateEmailInvitationBodySchema = z.object({
  email: z.email(),
});

export const ParamsTokenSchema = z.object({
  token: z.string().min(1),
});

export const AcceptInvitationBodySchema = z.object({
  token: z.string().min(1),
});
