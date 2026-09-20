import { Router, Request, Response } from "express";
import { coursesController } from "../controllers/coursesController";
import { pagination } from "api/middleware/pagination";
import { validate } from "api/middleware/validate";
import {
  CourseGetAllQuerySchema,
  CourseThumbnailUploadBodySchema,
  CourseThumbnailUploadCompleteBodySchema,
  CoursePostQuerySchema,
  CoursePutQuerySchema,
  ParamsIdSchema,
  ParamsPublicIdSchema,
  SearchSchema,
} from "@repo/contract";

const router: Router = Router();

// GET /courses → get all courses (own courses only unless showAllCreators=true)
router.get(
  //
  "/",
  pagination(),
  validate(SearchSchema, "query"),
  validate(CourseGetAllQuerySchema, "query"),
  async (req: Request, res: Response) => {
    await coursesController.getAllCourses(req, res);
  }
);

// GET /courses/:publicId → get course by publicId
router.get(
  //
  "/:publicId",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await coursesController.getCourseByPublicId(req, res);
  }
);

// POST /courses → create course
router.post(
  //
  "/",
  validate(CoursePostQuerySchema),
  async (req: Request, res: Response) => {
    await coursesController.createCourse(req, res);
  }
);

// POST /courses/thumbnails/uploads → initialize an R2 upload for a course thumbnail
router.post(
  //
  "/thumbnails/uploads",
  validate(CourseThumbnailUploadBodySchema),
  async (req: Request, res: Response) => {
    await coursesController.initializeThumbnailUpload(req, res);
  }
);

// POST /courses/thumbnails/uploads/complete → verify and save a course thumbnail
router.post(
  //
  "/thumbnails/uploads/complete",
  validate(CourseThumbnailUploadCompleteBodySchema),
  async (req: Request, res: Response) => {
    await coursesController.completeThumbnailUpload(req, res);
  }
);

// DELETE /courses/:id/thumbnail → remove a course thumbnail
router.delete(
  //
  "/:id/thumbnail",
  validate(ParamsIdSchema, "params"),
  async (req: Request, res: Response) => {
    await coursesController.deleteThumbnail(req, res);
  }
);

// PUT /courses/:id → update course
router.put(
  //
  "/:id",
  validate(ParamsIdSchema, "params"),
  validate(CoursePutQuerySchema),
  async (req: Request, res: Response) => {
    await coursesController.updateCourse(req, res);
  }
);

// DELETE /courses/:id → delete course
router.delete(
  //
  "/:id",
  validate(ParamsIdSchema, "params"),
  async (req: Request, res: Response) => {
    await coursesController.deleteCourse(req, res);
  }
);

export default router;
