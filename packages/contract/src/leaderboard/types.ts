import { z } from "zod";
import {
  CourseLeaderboardSchema,
  LeaderboardEntrySchema,
  MyLeaderboardNearbySchema,
} from "./schemas";

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

// GET /leaderboard/courses/:publicId → ranked learners of a course, paginated
export type GetCourseLeaderboardRes = z.infer<typeof CourseLeaderboardSchema>;

// GET /leaderboard/courses/:publicId/me → current learner's entry and the learners around it
export type GetMyLeaderboardNearbyRes = z.infer<typeof MyLeaderboardNearbySchema>;
