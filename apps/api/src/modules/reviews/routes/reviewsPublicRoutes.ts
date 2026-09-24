import { Router, Request, Response } from "express";
import { validate } from "api/middleware/validate";
import { pagination } from "api/middleware/pagination";
import { ParamsPublicIdSchema } from "@repo/contract";
import { reviewsController } from "../controllers/reviewsController";

const router: Router = Router();

// GET /public/reviews/courses/:publicId → paginated reviews, newest first, no auth required
router.get(
  //
  "/courses/:publicId",
  pagination(),
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await reviewsController.getCourseReviews(req, res);
  }
);

export default router;
