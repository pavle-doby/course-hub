import {
  ErrorCodeEnrollment,
  ErrorCodeProgress,
  GetCourseProgressRes,
  LessonProgressStatus,
  NotFoundError,
  UpdateLessonProgressReq,
  UpdateLessonProgressRes,
} from "@repo/contract";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { coursesRepository } from "api/modules/courses/repository/coursesRepository";
import { enrollmentsRepository } from "api/modules/enrollments/repository/enrollmentsRepository";
import { progressRepository } from "../repository/progressRepository";

// Topic and course status are derived from lesson statuses, never stored.
function deriveStatus(statuses: LessonProgressStatus[]): LessonProgressStatus {
  if (statuses.length > 0 && statuses.every((status) => status === "done")) {
    return "done";
  }
  if (statuses.every((status) => status === "todo")) {
    return "todo";
  }
  return "in_progress";
}

async function getEnrolledUserIdOrThrow(authUserId: string, courseId: string): Promise<string> {
  const user = await usersRepository.getUserByAuthUserId(authUserId);
  const enrollment = user && (await enrollmentsRepository.getEnrollment(user.id, courseId));
  if (!user || !enrollment || enrollment.withdrawnAt) {
    throw new NotFoundError({ code: ErrorCodeEnrollment.NOT_ENROLLED });
  }
  return user.id;
}

export const progressService = {
  getCourseProgress: async (
    authUserId: string,
    publicId: string
  ): Promise<GetCourseProgressRes> => {
    const course = await coursesRepository.getCourseByPublicId(publicId);
    if (!course) {
      throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });
    }
    const userId = await getEnrolledUserIdOrThrow(authUserId, course.id);

    const rows = await progressRepository.getCourseLessonStatuses(userId, course.id);
    const statusesByTopic = new Map<string, LessonProgressStatus[]>();
    let lastRow: (typeof rows)[number] | undefined;
    for (const row of rows) {
      statusesByTopic.set(row.topicId, [...(statusesByTopic.get(row.topicId) ?? []), row.status]);
      if (
        row.lastActivityAt &&
        (!lastRow?.lastActivityAt || row.lastActivityAt > lastRow.lastActivityAt)
      ) {
        lastRow = row;
      }
    }

    return {
      status: deriveStatus(rows.map((row) => row.status)),
      lastLessonId: lastRow?.lessonId ?? null,
      topics: [...statusesByTopic].map(([topicId, statuses]) => ({
        topicId,
        status: deriveStatus(statuses),
      })),
      lessons: rows.map(({ lessonId, status, progressSeconds }) => ({
        lessonId,
        status,
        progressSeconds: Number(progressSeconds),
      })),
    };
  },

  updateLessonProgress: async (
    authUserId: string,
    lessonId: string,
    dto: UpdateLessonProgressReq
  ): Promise<UpdateLessonProgressRes> => {
    const courseId = await progressRepository.getLessonCourseId(lessonId);
    if (!courseId) {
      throw new NotFoundError({ code: ErrorCodeProgress.LESSON_NOT_FOUND });
    }
    const userId = await getEnrolledUserIdOrThrow(authUserId, courseId);

    return await progressRepository.saveLessonProgress(userId, lessonId, courseId, dto);
  },
};
