import { z } from "zod";
import { PaginationSchema } from "../shared";
import { CourseCreatorSchema } from "../courses/schemas";
import { UserSchema } from "../users/schemas";

export const LeaderboardEntrySchema = z.object({
  /** Standard competition rank: equal points share a place (1, 2, 2, 4). */
  place: z.number().int(),
  points: z.number().int(),
  isWithdrawn: z.boolean(),
  /** `email` is only filled for the course creator. */
  user: CourseCreatorSchema.extend({ email: UserSchema.shape.email.nullable() }),
});

export const CourseLeaderboardSchema = z.object({
  data: z.array(LeaderboardEntrySchema),
  pagination: PaginationSchema,
  /** The current learner's entry; null for the course creator. */
  me: LeaderboardEntrySchema.nullable(),
});

export const MyLeaderboardNearbySchema = z.object({
  /** Null for the course creator. */
  me: LeaderboardEntrySchema.nullable(),
  /** The current learner's entry with a few learners above and below it, in rank order. */
  entries: z.array(LeaderboardEntrySchema),
});
