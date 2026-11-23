import { Router, Request, Response } from "express";
import { validate } from "api/middleware/validate";
import { pagination } from "api/middleware/pagination";
import { ParamsPublicIdSchema } from "@repo/contract";
import { leaderboardController } from "../controllers/leaderboardController";

const router: Router = Router();

// GET /leaderboard/courses/:publicId → ranked learners of a course, creator or enrolled learners only
router.get(
  //
  "/courses/:publicId",
  pagination(),
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await leaderboardController.getCourseLeaderboard(req, res);
  }
);

// GET /leaderboard/courses/:publicId/me → current learner's entry and the learners around it
router.get(
  //
  "/courses/:publicId/me",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await leaderboardController.getMyLeaderboardNearby(req, res);
  }
);

export default router;
