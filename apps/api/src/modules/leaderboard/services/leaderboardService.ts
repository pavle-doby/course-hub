import {
  ErrorCodeEnrollment,
  NotFoundError,
  type GetCourseLeaderboardRes,
  type GetMyLeaderboardNearbyRes,
  type LeaderboardEntry,
} from "@repo/contract";
import type { PaginationReqExtended } from "api/middleware/pagination";
import { coursesRepository } from "api/modules/courses/repository/coursesRepository";
import { enrollmentsRepository } from "api/modules/enrollments/repository/enrollmentsRepository";
import { usersRepository } from "api/modules/users/repository/usersRepository";
import { progressRepository } from "api/modules/progress/repository/progressRepository";
import { toLearnerState } from "api/modules/progress/services/progressService";
import { leaderboardRepository } from "../repository/leaderboardRepository";
import { scoreLearner } from "./scoreLearner";

const NEARBY_COUNT = 2;

// Only the course creator and learners with an active enrollment can see the leaderboard.
async function getViewerOrThrow(
  authUserId: string,
  publicId: string
): Promise<{ userId: string; courseId: string; isCreator: boolean }> {
  const course = await coursesRepository.getCourseByPublicId(publicId);
  if (!course) {
    throw new NotFoundError({ code: ErrorCodeEnrollment.COURSE_NOT_FOUND });
  }
  const user = await usersRepository.getUserByAuthUserId(authUserId);
  if (user && course.creatorId === user.id) {
    return { userId: user.id, courseId: course.id, isCreator: true };
  }
  const enrollment = user && (await enrollmentsRepository.getEnrollment(user.id, course.id));
  if (!user || !enrollment || enrollment.withdrawnAt) {
    throw new NotFoundError({ code: ErrorCodeEnrollment.NOT_ENROLLED });
  }
  return { userId: user.id, courseId: course.id, isCreator: false };
}

// ponytail: scores every learner in memory on each read; fine for course-sized enrollments.
// Move to SQL or a cached points column if a course reaches thousands of learners.
async function getRankedEntries(viewer: {
  courseId: string;
  isCreator: boolean;
}): Promise<LeaderboardEntry[]> {
  const learners = await leaderboardRepository.getCourseLearners(viewer.courseId);
  const userIds = learners.map((learner) => learner.userId);
  const [content, rows, days] = await Promise.all([
    progressRepository.getCourseContent(viewer.courseId),
    progressRepository.getLearnerRows(viewer.courseId, userIds),
    leaderboardRepository.getActivityDays(viewer.courseId),
  ]);

  const scored = learners.map((learner) => {
    const learnerDays = days.filter((row) => row.userId === learner.userId).map((row) => row.day);
    const watchedLessonVideoIds = new Set(
      rows.lessons
        .filter((row) => row.userId === learner.userId && row.videoWatchedAt)
        .map((row) => row.lessonId)
    );
    const points = scoreLearner(
      content,
      toLearnerState(rows, learner.userId),
      watchedLessonVideoIds,
      learnerDays
    );
    const name =
      [learner.firstName, learner.lastName].filter(Boolean).join(" ") || learner.username;
    return { learner, points, name, lastDay: learnerDays.sort().at(-1) ?? "9999-12-31" };
  });

  // Most points first; equal points → who got there first (earlier last active day), then name.
  scored.sort(
    (a, b) =>
      b.points - a.points || a.lastDay.localeCompare(b.lastDay) || a.name.localeCompare(b.name)
  );

  return scored.map(({ learner, points }) => ({
    // Standard competition ranking: equal points share the place of the first of them.
    place: scored.findIndex((item) => item.points === points) + 1,
    points,
    isWithdrawn: Boolean(learner.withdrawnAt),
    user: {
      id: learner.userId,
      firstName: learner.firstName,
      lastName: learner.lastName,
      username: learner.username,
      avatarUrl: learner.avatarUrl,
      email: viewer.isCreator ? learner.email : null,
    },
  }));
}

export const leaderboardService = {
  getCourseLeaderboard: async (
    authUserId: string,
    publicId: string,
    pagination: PaginationReqExtended
  ): Promise<GetCourseLeaderboardRes> => {
    const viewer = await getViewerOrThrow(authUserId, publicId);
    const entries = await getRankedEntries(viewer);
    const { page, limit, offset } = pagination;
    const start = offset ?? 0;
    return {
      data: entries.slice(start, limit ? start + limit : undefined),
      pagination: { total: entries.length, page, limit: limit || entries.length },
      me: entries.find((entry) => entry.user.id === viewer.userId) ?? null,
    };
  },

  // The current learner's entry with up to NEARBY_COUNT learners above and below it.
  getMyLeaderboardNearby: async (
    authUserId: string,
    publicId: string
  ): Promise<GetMyLeaderboardNearbyRes> => {
    const viewer = await getViewerOrThrow(authUserId, publicId);
    const entries = await getRankedEntries(viewer);
    const index = entries.findIndex((entry) => entry.user.id === viewer.userId);
    if (index === -1) {
      return { me: null, entries: [] };
    }
    return {
      me: entries[index]!,
      entries: entries.slice(Math.max(0, index - NEARBY_COUNT), index + NEARBY_COUNT + 1),
    };
  },
};
