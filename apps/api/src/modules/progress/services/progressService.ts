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
import { notificationsService } from "api/modules/notifications/services/notificationsService";
import { quizzesRepository } from "api/modules/quizzes/repository/quizzesRepository";
import { scoreQuiz } from "api/modules/quizzes/services/scoreQuiz";
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

async function getEnrolledUserOrThrow(
  authUserId: string,
  courseId: string
): Promise<{ id: string; email: string }> {
  const user = await usersRepository.getUserByAuthUserId(authUserId);
  const enrollment = user && (await enrollmentsRepository.getEnrollment(user.id, courseId));
  if (!user || !enrollment || enrollment.withdrawnAt) {
    throw new NotFoundError({ code: ErrorCodeEnrollment.NOT_ENROLLED });
  }
  return user;
}

async function notifyCourseCompleted(courseId: string, email: string): Promise<void> {
  const course = await coursesRepository.getCourseById(courseId);
  if (course) {
    await notificationsService.notifyCourseCompleted(course, email);
  }
}

// Status a lesson's content earns: done once its video (if any) is watched to the end and its quiz
// (if any) has every graded answer right; otherwise in progress.
async function getEarnedLessonStatus(
  userId: string,
  lessonId: string,
  isVideoJustWatched = false
): Promise<LessonProgressStatus> {
  const [video, quiz] = await Promise.all([
    progressRepository.getLessonVideoState(userId, lessonId),
    quizzesRepository.getByParent({ parentType: "lesson", parentId: lessonId }),
  ]);
  const response = quiz && (await quizzesRepository.getResponse(userId, quiz.id));
  const result = quiz && response && scoreQuiz(quiz.questions, response.answers);

  const isVideoDone = !video.hasVideo || video.isVideoWatched || isVideoJustWatched;
  const isQuizDone = !quiz || (!!result && result.score === result.total);
  return isVideoDone && isQuizDone ? "done" : "in_progress";
}

async function saveLessonProgress(
  user: { id: string; email: string },
  lessonId: string,
  courseId: string,
  dto: UpdateLessonProgressReq
): Promise<UpdateLessonProgressRes> {
  const { progress, isCourseCompleted } = await progressRepository.saveLessonProgress(
    user.id,
    lessonId,
    courseId,
    dto
  );
  if (isCourseCompleted) {
    void notifyCourseCompleted(courseId, user.email).catch(() => undefined);
  }
  return progress;
}

async function getLessonCourseIdOrThrow(lessonId: string): Promise<string> {
  const courseId = await progressRepository.getLessonCourseId(lessonId);
  if (!courseId) {
    throw new NotFoundError({ code: ErrorCodeProgress.LESSON_NOT_FOUND });
  }
  return courseId;
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
    const { id: userId } = await getEnrolledUserOrThrow(authUserId, course.id);

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

  // A manual status is saved as is; a watched video derives the status from the lesson's content.
  updateLessonProgress: async (
    authUserId: string,
    lessonId: string,
    dto: UpdateLessonProgressReq
  ): Promise<UpdateLessonProgressRes> => {
    const courseId = await getLessonCourseIdOrThrow(lessonId);
    const user = await getEnrolledUserOrThrow(authUserId, courseId);
    const status = dto.videoWatched
      ? await getEarnedLessonStatus(user.id, lessonId, true)
      : dto.status;
    return await saveLessonProgress(user, lessonId, courseId, { ...dto, status });
  },

  // Re-derives a lesson's status after its quiz answers were saved or cleared.
  syncLessonStatus: async (authUserId: string, lessonId: string): Promise<void> => {
    const courseId = await getLessonCourseIdOrThrow(lessonId);
    const user = await getEnrolledUserOrThrow(authUserId, courseId);
    const status = await getEarnedLessonStatus(user.id, lessonId);
    await saveLessonProgress(user, lessonId, courseId, { status });
  },
};
