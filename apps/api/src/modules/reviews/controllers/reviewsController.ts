import {
  GetCourseReviewsRes,
  GetMyCourseReviewRes,
  SaveCourseReviewReq,
  SaveCourseReviewRes,
  SaveReviewReplyParams,
  SaveReviewReplyReq,
  SaveReviewReplyRes,
} from "@repo/contract";
import { Request, Response } from "express";
import { PaginationReqExtended } from "api/middleware/pagination";
import { reviewsService } from "../services/reviewsService";

export const reviewsController = {
  getMyReview: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const resDto: GetMyCourseReviewRes = await reviewsService.getMyReview(authUserId, publicId);
    res.status(200).json(resDto);
  },

  saveReview: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const reqDto = res.locals.body as SaveCourseReviewReq;
    const resDto: SaveCourseReviewRes = await reviewsService.saveReview(
      authUserId,
      publicId,
      reqDto
    );
    res.status(200).json(resDto);
  },

  saveReply: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { reviewId } = res.locals.params as SaveReviewReplyParams;
    const reqDto = res.locals.body as SaveReviewReplyReq;
    const resDto: SaveReviewReplyRes = await reviewsService.saveReply(authUserId, reviewId, reqDto);
    res.status(200).json(resDto);
  },

  getCourseReviews: async (_req: Request, res: Response): Promise<void> => {
    const { publicId } = res.locals.params as { publicId: string };
    const pagination = res.locals.pagination as PaginationReqExtended;
    const resDto: GetCourseReviewsRes = await reviewsService.getCourseReviews(publicId, pagination);
    res.status(200).json(resDto);
  },
};
