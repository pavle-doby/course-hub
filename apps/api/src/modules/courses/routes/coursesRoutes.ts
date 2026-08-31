import { Router, Request, Response } from "express";
import { coursesController } from "../controllers/coursesController";
import { pagination } from "api/middleware/pagination";
import { validate } from "api/middleware/validate";
import {
  CourseGetAllQuerySchema,
  CoursePostQuerySchema,
  CoursePutQuerySchema,
  ParamsIdSchema,
  ParamsPublicIdSchema,
  SearchSchema,
} from "@repo/contract";

const router: Router = Router();

// GET /courses → get all courses for current user
router.get(
  "/",
  pagination(),
  validate(SearchSchema, "query"),
  validate(CourseGetAllQuerySchema, "query"),
  async (req: Request, res: Response) => {
    await coursesController.getAllCourses(req, res);
  }
);

// GET /courses/public/:publicId → get course by public id (must be registered before /:id)
router.get(
  "/public/:publicId",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await coursesController.getCourseByPublicId(req, res);
  }
);

// GET /courses/:id → get course by id
router.get("/:id", validate(ParamsIdSchema, "params"), async (req: Request, res: Response) => {
  await coursesController.getCourse(req, res);
});

// POST /courses → create course
router.post("/", validate(CoursePostQuerySchema), async (req: Request, res: Response) => {
  await coursesController.createCourse(req, res);
});

// PUT /courses/:id → update course
router.put(
  "/:id",
  validate(ParamsIdSchema, "params"),
  validate(CoursePutQuerySchema),
  async (req: Request, res: Response) => {
    await coursesController.updateCourse(req, res);
  }
);

// DELETE /courses/:id → delete course
router.delete("/:id", validate(ParamsIdSchema, "params"), async (req: Request, res: Response) => {
  await coursesController.deleteCourse(req, res);
});

export default router;
