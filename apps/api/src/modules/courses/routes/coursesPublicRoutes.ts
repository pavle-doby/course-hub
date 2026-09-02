import { Router, Request, Response } from "express";
import { coursesController } from "../controllers/coursesController";
import { validate } from "api/middleware/validate";
import { pagination } from "api/middleware/pagination";
import { ParamsPublicIdSchema, SearchSchema } from "@repo/contract";

const router: Router = Router();

// GET /public/courses → get all published courses, no auth required
router.get(
  "/",
  pagination(),
  validate(SearchSchema, "query"),
  async (req: Request, res: Response) => {
    await coursesController.getAllPublicCourses(req, res);
  }
);

// GET /public/courses/:publicId → get published course by public id, no auth required
router.get(
  "/:publicId",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await coursesController.getCourseByPublicId(req, res);
  }
);

// GET /public/courses/:publicId/topics → topics for a published course, no auth required
router.get(
  "/:publicId/topics",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await coursesController.getPublicCourseTopics(req, res);
  }
);

// GET /public/courses/:publicId/lessons → lessons for a published course, no auth required
router.get(
  "/:publicId/lessons",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await coursesController.getPublicCourseLessons(req, res);
  }
);

export default router;
