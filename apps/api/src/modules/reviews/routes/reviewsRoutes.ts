import { Router, Request, Response } from "express";
import { validate } from "api/middleware/validate";
import {
  ParamsPublicIdSchema,
  ReviewParamsSchema,
  SaveCourseReviewBodySchema,
  SaveReviewReplyBodySchema,
} from "@repo/contract";
import { reviewsController } from "../controllers/reviewsController";

const router: Router = Router();

// GET /reviews/courses/:publicId/me → current user's review, or null
router.get(
  //
  "/courses/:publicId/me",
  validate(ParamsPublicIdSchema, "params"),
  async (req: Request, res: Response) => {
    await reviewsController.getMyReview(req, res);
  }
);

// PUT /reviews/courses/:publicId → create or replace the current user's review
router.put(
  //
  "/courses/:publicId",
  validate(ParamsPublicIdSchema, "params"),
  validate(SaveCourseReviewBodySchema),
  async (req: Request, res: Response) => {
    await reviewsController.saveReview(req, res);
  }
);

// PUT /reviews/:reviewId/reply → course creator sets or clears their reply to a review
router.put(
  //
  "/:reviewId/reply",
  validate(ReviewParamsSchema, "params"),
  validate(SaveReviewReplyBodySchema),
  async (req: Request, res: Response) => {
    await reviewsController.saveReply(req, res);
  }
);

export default router;
