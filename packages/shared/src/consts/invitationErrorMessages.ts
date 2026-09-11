import { ErrorCodeInvitation } from "@repo/contract";

export const invitationErrorMessages: Record<
  ErrorCodeInvitation,
  { title: string; message: string }
> = {
  [ErrorCodeInvitation.COURSE_NOT_FOUND]: {
    title: "errors.invitation.COURSE_NOT_FOUND.title",
    message: "errors.invitation.COURSE_NOT_FOUND.message",
  },
  [ErrorCodeInvitation.COURSE_NOT_PRIVATE]: {
    title: "errors.invitation.COURSE_NOT_PRIVATE.title",
    message: "errors.invitation.COURSE_NOT_PRIVATE.message",
  },
  [ErrorCodeInvitation.INVALID_TOKEN]: {
    title: "errors.invitation.INVALID_TOKEN.title",
    message: "errors.invitation.INVALID_TOKEN.message",
  },
  [ErrorCodeInvitation.EXPIRED]: {
    title: "errors.invitation.EXPIRED.title",
    message: "errors.invitation.EXPIRED.message",
  },
  [ErrorCodeInvitation.ALREADY_USED]: {
    title: "errors.invitation.ALREADY_USED.title",
    message: "errors.invitation.ALREADY_USED.message",
  },
  [ErrorCodeInvitation.NOT_FOUND]: {
    title: "errors.invitation.NOT_FOUND.title",
    message: "errors.invitation.NOT_FOUND.message",
  },
  [ErrorCodeInvitation.EMAIL_MISMATCH]: {
    title: "errors.invitation.EMAIL_MISMATCH.title",
    message: "errors.invitation.EMAIL_MISMATCH.message",
  },
};
