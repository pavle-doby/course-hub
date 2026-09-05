import { Router, Request, Response } from "express";
import { validate } from "api/middleware/validate";
import { pagination } from "api/middleware/pagination";
import { EnrollCourseBodySchema, ParamsPublicIdSchema, SearchSchema } from "@repo/contract";
import { enrollmentsController } from "../controllers/enrollmentsController";

const router: Router = Router();

// POST /enrollments → enroll current user into a published course
router.post("/", validate(EnrollCourseBodySchema), async (req: Request, res: Response) => {
  await enrollmentsController.enrollInCourse(req, res);
});

// GET /enrollments/courses → courses current user is enrolled in
router.get(
  "/courses",
  pagination(),
  validate(SearchSchema, "query"),
  async (req: Request, res: Response) => {
    await enrollmentsController.getAllEnrolledCourses(req, res);
  }
);

// GET /enrollments/courses/:publicId → is current user enrolled in this course
router.get(
  "/courses/:publicId",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await enrollmentsController.getEnrollmentStatus(req, res);
  }
);

// DELETE /enrollments/courses/:publicId → withdraw current user from an enrolled course
router.delete(
  "/courses/:publicId",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await enrollmentsController.withdrawFromCourse(req, res);
  }
);

// GET /enrollments/courses/:publicId/topics → full topics, requires enrollment
router.get(
  "/courses/:publicId/topics",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await enrollmentsController.getEnrolledCourseTopics(req, res);
  }
);

// GET /enrollments/courses/:publicId/lessons → full lessons, requires enrollment
router.get(
  "/courses/:publicId/lessons",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await enrollmentsController.getEnrolledCourseLessons(req, res);
  }
);

export default router;
