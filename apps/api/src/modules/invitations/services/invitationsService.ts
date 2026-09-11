import {
  BadRequestError,
  CourseInvitation,
  CreateEmailInvitationRes,
  CreateInviteLinkRes,
  ErrorCode,
  ErrorCodeInvitation,
  ForbiddenError,
  GetAllInvitationsReq,
  GetAllInvitationsRes,
  GetInvitationInfoRes,
  AcceptInvitationRes,
  NotFoundError,
  RevokeInvitationRes,
} from "@repo/contract";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { coursesRepository } from "api/modules/courses/repository/coursesRepository";
import { enrollmentsRepository } from "api/modules/enrollments/repository/enrollmentsRepository";
import { PaginationReqExtended } from "api/middleware/pagination";
import { invitationsRepository } from "../repository/invitationsRepository";

async function getCourseOrThrow(publicId: string) {
  const course = await coursesRepository.getCourseByPublicId(publicId);
  if (!course) throw new NotFoundError({ code: ErrorCodeInvitation.COURSE_NOT_FOUND });
  return course;
}

function assertPrivateOrThrow(course: { visibility: string }) {
  if (course.visibility !== "private") {
    throw new BadRequestError({ code: ErrorCodeInvitation.COURSE_NOT_PRIVATE });
  }
}

function assertCreatorOrThrow(course: { creatorId: string }, userId: string) {
  if (course.creatorId !== userId) {
    throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
  }
}

function assertUsableOrThrow(invitation: CourseInvitation) {
  if (invitation.status !== "pending") {
    throw new BadRequestError({ code: ErrorCodeInvitation.ALREADY_USED });
  }
  if (invitation.expiresAt < new Date()) {
    throw new BadRequestError({ code: ErrorCodeInvitation.EXPIRED });
  }
}

export const invitationsService = {
  createEmailInvitation: async (
    authUserId: string,
    publicId: string,
    email: string
  ): Promise<CreateEmailInvitationRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeInvitation.COURSE_NOT_FOUND });

    const course = await getCourseOrThrow(publicId);
    assertCreatorOrThrow(course, user.id);
    assertPrivateOrThrow(course);

    return await invitationsRepository.createEmailInvitation(course.id, user.id, email);
  },

  createLinkInvitation: async (
    authUserId: string,
    publicId: string
  ): Promise<CreateInviteLinkRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeInvitation.COURSE_NOT_FOUND });

    const course = await getCourseOrThrow(publicId);
    assertCreatorOrThrow(course, user.id);
    assertPrivateOrThrow(course);

    return await invitationsRepository.createLinkInvitation(course.id, user.id);
  },

  getAllInvitations: async (
    authUserId: string,
    publicId: string,
    dto: GetAllInvitationsReq<PaginationReqExtended>
  ): Promise<GetAllInvitationsRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeInvitation.COURSE_NOT_FOUND });

    const course = await getCourseOrThrow(publicId);
    assertCreatorOrThrow(course, user.id);

    return await invitationsRepository.getInvitationsByCourseId(course.id, dto);
  },

  revokeInvitation: async (authUserId: string, id: string): Promise<RevokeInvitationRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeInvitation.COURSE_NOT_FOUND });

    const invitation = await invitationsRepository.getInvitationById(id);
    if (!invitation) throw new NotFoundError({ code: ErrorCodeInvitation.NOT_FOUND });

    const course = await coursesRepository.getCourseById(invitation.courseId);
    if (!course) throw new NotFoundError({ code: ErrorCodeInvitation.COURSE_NOT_FOUND });
    assertCreatorOrThrow(course, user.id);

    const revoked = await invitationsRepository.revokeInvitation(id);
    if (!revoked) throw new BadRequestError({ code: ErrorCodeInvitation.ALREADY_USED });
    return revoked;
  },

  getInvitationInfo: async (token: string): Promise<GetInvitationInfoRes> => {
    const invitation = await invitationsRepository.getInvitationByToken(token);
    if (!invitation) throw new NotFoundError({ code: ErrorCodeInvitation.INVALID_TOKEN });
    assertUsableOrThrow(invitation);

    const course = await coursesRepository.getCourseById(invitation.courseId);
    if (!course) throw new NotFoundError({ code: ErrorCodeInvitation.COURSE_NOT_FOUND });

    return {
      course: { name: course.name, publicId: course.publicId, description: course.description },
      type: invitation.type,
      email: invitation.email,
    };
  },

  acceptInvitation: async (authUserId: string, token: string): Promise<AcceptInvitationRes> => {
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user) throw new NotFoundError({ code: ErrorCodeInvitation.COURSE_NOT_FOUND });

    const invitation = await invitationsRepository.getInvitationByToken(token);
    if (!invitation) throw new NotFoundError({ code: ErrorCodeInvitation.INVALID_TOKEN });
    assertUsableOrThrow(invitation);

    if (invitation.type === "email" && invitation.email !== user.email) {
      throw new ForbiddenError({ code: ErrorCodeInvitation.EMAIL_MISMATCH });
    }

    const course = await coursesRepository.getCourseById(invitation.courseId);
    if (!course) throw new NotFoundError({ code: ErrorCodeInvitation.COURSE_NOT_FOUND });

    const existing = await enrollmentsRepository.getEnrollment(user.id, course.id);
    if (existing?.withdrawnAt) {
      await enrollmentsRepository.reactivateEnrollment(existing.id);
    } else if (!existing) {
      await enrollmentsRepository.createEnrollment(user.id, course.id);
    }

    await invitationsRepository.acceptInvitation(invitation.id, user.id);

    return { enrolled: true, course: { publicId: course.publicId } };
  },
};
