import {
  ErrorCode,
  ErrorCodeEnrollment,
  ErrorCodeReview,
  ForbiddenError,
  GetCourseReviewsRes,
  GetMyCourseReviewRes,
  NotFoundError,
  SaveCourseReviewReq,
  SaveCourseReviewRes,
  SaveReviewReplyReq,
  SaveReviewReplyRes,
} from "@repo/contract";
import { PaginationReqExtended } from "api/middleware/pagination";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { coursesRepository } from "api/modules/courses/repository/coursesRepository";
import { enrollmentsRepository } from "api/modules/enrollments/repository/enrollmentsRepository";
import { reviewsRepository } from "../repository/reviewsRepository";

async function getPublishedCourseOrThrow(publicId: string) {
  const course = await coursesRepository.getCourseByPublicId(publicId);
  if (!course || course.status !== "published") {
    throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });
  }
  return course;
}

export const reviewsService = {
  getMyReview: async (authUserId: string, publicId: string): Promise<GetMyCourseReviewRes> => {
    const course = await getPublishedCourseOrThrow(publicId);
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    const review = user && (await reviewsRepository.getReview(user.id, course.id));
    return { review: review ?? null };
  },

  saveReview: async (
    authUserId: string,
    publicId: string,
    dto: SaveCourseReviewReq
  ): Promise<SaveCourseReviewRes> => {
    const course = await getPublishedCourseOrThrow(publicId);
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    const enrollment = user && (await enrollmentsRepository.getEnrollment(user.id, course.id));
    if (!user || !enrollment || enrollment.withdrawnAt) {
      throw new NotFoundError({ code: ErrorCodeEnrollment.NOT_ENROLLED });
    }

    await reviewsRepository.saveReview(user.id, course.id, dto);
    return (await reviewsRepository.getReview(user.id, course.id))!;
  },

  // Only the creator of the reviewed course can reply; a blank reply clears it.
  saveReply: async (
    authUserId: string,
    reviewId: string,
    { reply }: SaveReviewReplyReq
  ): Promise<SaveReviewReplyRes> => {
    const creatorId = await reviewsRepository.getReviewCourseCreatorId(reviewId);
    if (!creatorId) {
      throw new NotFoundError({ code: ErrorCodeReview.NOT_FOUND });
    }
    const user = await usersRepository.getUserByAuthUserId(authUserId);
    if (!user || user.id !== creatorId) {
      throw new ForbiddenError({ code: ErrorCode.FORBIDDEN });
    }

    await reviewsRepository.saveReply(reviewId, reply || null);
    return (await reviewsRepository.getReviewById(reviewId))!;
  },

  getCourseReviews: async (
    publicId: string,
    pagination: PaginationReqExtended
  ): Promise<GetCourseReviewsRes> => {
    const course = await getPublishedCourseOrThrow(publicId);
    return await reviewsRepository.getCourseReviews({ ...pagination, courseId: course.id });
  },
};
