import { z } from "zod";
import type { Course } from "../courses";
import type { PaginationReq, PaginationRes, Search } from "../shared";
import {
  AcceptInvitationBodySchema,
  CourseInvitationSchema,
  CreateEmailInvitationBodySchema,
  InvitationUserSchema,
} from "./schemas";

export type CourseInvitation = z.infer<typeof CourseInvitationSchema>;
export type InvitationUser = z.infer<typeof InvitationUserSchema>;

// POST /courses/:publicId/invitations → invite a specific email to a private course
export type CreateEmailInvitationReq = z.infer<typeof CreateEmailInvitationBodySchema>;
export type CreateEmailInvitationRes = CourseInvitation;

// POST /courses/:publicId/invitations/link → generate a one-time enrollment link
export type CreateInviteLinkRes = CourseInvitation;

// GET /courses/:publicId/invitations → list invitations for a course (creator only)
export type GetAllInvitationsReq<Pagination = PaginationReq> = Pagination & Partial<Search>;
export type GetAllInvitationsRes = PaginationRes<CourseInvitation>;

// DELETE /invitations/:id → revoke a pending invitation (creator only)
export type RevokeInvitationRes = CourseInvitation | undefined;

// GET /public/invitations/:token → look up an invitation by token, no auth required
export type GetInvitationInfoRes = {
  course: Pick<Course, "name" | "publicId" | "description">;
  type: CourseInvitation["type"];
  email: string | null;
};

// POST /invitations/:token/accept → accept an invitation and enroll the current user
export type AcceptInvitationReq = z.infer<typeof AcceptInvitationBodySchema>;
export type AcceptInvitationRes = { enrolled: true; course: Pick<Course, "publicId"> };
