import { Router, Request, Response } from "express";
import { validate } from "api/middleware/validate";
import {
  LessonProgressParamsSchema,
  ParamsPublicIdSchema,
  UpdateLessonProgressBodySchema,
} from "@repo/contract";
import { progressController } from "../controllers/progressController";

const router: Router = Router();

// GET /progress/courses/:publicId → current user's progress in an enrolled course
router.get(
  //
  "/courses/:publicId",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await progressController.getCourseProgress(req, res);
  }
);

// PUT /progress/lessons/:lessonId → set current user's lesson status and/or video position
router.put(
  //
  "/lessons/:lessonId",
  validate(LessonProgressParamsSchema, "params"),
  validate(UpdateLessonProgressBodySchema),
  async (req: Request, res: Response) => {
    await progressController.updateLessonProgress(req, res);
  }
);

export default router;
