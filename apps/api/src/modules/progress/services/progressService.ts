import {
  BadRequestError,
  ErrorCodeEnrollment,
  ErrorCodeProgress,
  GetCourseProgressRes,
  LessonProgressStatus,
  NotFoundError,
  UpdateLessonProgressReq,
  UpdateLessonProgressRes,
  UpdateTopicProgressReq,
} from "@repo/contract";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { coursesRepository } from "api/modules/courses/repository/coursesRepository";
import { enrollmentsRepository } from "api/modules/enrollments/repository/enrollmentsRepository";
import { notificationsService } from "api/modules/notifications/services/notificationsService";
import { quizzesRepository } from "api/modules/quizzes/repository/quizzesRepository";
import { scoreQuiz } from "api/modules/quizzes/services/scoreQuiz";
import { progressRepository, type LearnerRows } from "../repository/progressRepository";
import { deriveCourseProgress, type LearnerState } from "./deriveCourseProgress";

/** One learner's state out of rows loaded for one or more learners. */
export function toLearnerState(rows: LearnerRows, userId: string): LearnerState {
  return {
    lessonStatuses: new Map(
      rows.lessons.filter((row) => row.userId === userId).map((row) => [row.lessonId, row.status])
    ),
    watchedTopicIds: new Set(
      rows.topics
        .filter((row) => row.userId === userId && row.videoWatchedAt)
        .map((row) => row.topicId)
    ),
    answersByQuizId: new Map(
      rows.quizResponses
        .filter((row) => row.userId === userId)
        .map((row) => [row.quizId, row.answers])
    ),
  };
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

// Topic/course gates (topic video, topic and course quizzes) can't be seen from a single lesson
// save, so completion is re-derived from the whole course after every change that can affect it.
async function syncCourseCompletion(
  user: { id: string; email: string },
  courseId: string
): Promise<void> {
  const [content, rows] = await Promise.all([
    progressRepository.getCourseContent(courseId),
    progressRepository.getLearnerRows(courseId, [user.id]),
  ]);
  const { status } = deriveCourseProgress(content, toLearnerState(rows, user.id));
  const isNewlyCompleted = await progressRepository.setEnrollmentCompleted(
    user.id,
    courseId,
    status === "done"
  );
  if (isNewlyCompleted) {
    void notifyCourseCompleted(courseId, user.email).catch(() => undefined);
  }
}

async function saveLessonProgress(
  user: { id: string; email: string },
  lessonId: string,
  courseId: string,
  dto: UpdateLessonProgressReq
): Promise<UpdateLessonProgressRes> {
  const progress = await progressRepository.saveLessonProgress(user.id, lessonId, courseId, dto);
  if (dto.status) {
    await syncCourseCompletion(user, courseId);
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

    const [content, rows] = await Promise.all([
      progressRepository.getCourseContent(course.id),
      progressRepository.getLearnerRows(course.id, [userId]),
    ]);
    const derived = deriveCourseProgress(content, toLearnerState(rows, userId));
    const rowsByLessonId = new Map(rows.lessons.map((row) => [row.lessonId, row]));
    const lastRow = rows.lessons.reduce<(typeof rows.lessons)[number] | undefined>(
      (last, row) => (!last || row.updatedAt > last.updatedAt ? row : last),
      undefined
    );
    const quizLessonIds = new Set(content.quizzes.map((quiz) => quiz.lessonId));

    return {
      status: derived.status,
      lastLessonId: lastRow?.lessonId ?? null,
      topics: [...derived.topicStatuses].map(([topicId, status]) => ({ topicId, status })),
      lessons: content.lessons.map(({ id }) => ({
        lessonId: id,
        status: rowsByLessonId.get(id)?.status ?? ("todo" satisfies LessonProgressStatus),
        progressSeconds: rowsByLessonId.get(id)?.progressSeconds ?? 0,
      })),
      gatedLessonIds: content.lessons
        .filter((lesson) => lesson.hasVideo || quizLessonIds.has(lesson.id))
        .map((lesson) => lesson.id),
    };
  },

  // A watched video derives the status from the lesson's content. A manual status is saved as is,
  // except Done on a lesson with a ready video or a quiz, which needs both finished first.
  updateLessonProgress: async (
    authUserId: string,
    lessonId: string,
    dto: UpdateLessonProgressReq
  ): Promise<UpdateLessonProgressRes> => {
    const courseId = await getLessonCourseIdOrThrow(lessonId);
    const user = await getEnrolledUserOrThrow(authUserId, courseId);
    if (dto.videoWatched) {
      const status = await getEarnedLessonStatus(user.id, lessonId, true);
      return await saveLessonProgress(user, lessonId, courseId, { ...dto, status });
    }
    if (dto.status === "done" && (await getEarnedLessonStatus(user.id, lessonId)) !== "done") {
      throw new BadRequestError({ code: ErrorCodeProgress.LESSON_NOT_EARNED });
    }
    return await saveLessonProgress(user, lessonId, courseId, dto);
  },

  // The topic video was watched to the end; it can complete the topic and the course.
  updateTopicProgress: async (
    authUserId: string,
    topicId: string,
    _dto: UpdateTopicProgressReq
  ): Promise<void> => {
    const courseId = await progressRepository.getTopicCourseId(topicId);
    if (!courseId) {
      throw new NotFoundError({ code: ErrorCodeProgress.TOPIC_NOT_FOUND });
    }
    const user = await getEnrolledUserOrThrow(authUserId, courseId);
    await progressRepository.saveTopicVideoWatched(user.id, topicId);
    await progressRepository.touchActivityDay(user.id, courseId);
    await syncCourseCompletion(user, courseId);
  },

  // A topic or course quiz was saved or cleared: record the activity and re-check completion.
  syncCourseQuiz: async (authUserId: string, courseId: string): Promise<void> => {
    const user = await getEnrolledUserOrThrow(authUserId, courseId);
    await progressRepository.touchActivityDay(user.id, courseId);
    await syncCourseCompletion(user, courseId);
  },

  // Re-derives a lesson's status after its quiz answers were saved or cleared.
  syncLessonStatus: async (authUserId: string, lessonId: string): Promise<void> => {
    const courseId = await getLessonCourseIdOrThrow(lessonId);
    const user = await getEnrolledUserOrThrow(authUserId, courseId);
    const status = await getEarnedLessonStatus(user.id, lessonId);
    await saveLessonProgress(user, lessonId, courseId, { status });
  },
};
