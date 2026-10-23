import { GetCourseLeaderboardRes, GetMyLeaderboardNearbyRes } from "@repo/contract";
import { Request, Response } from "express";
import { PaginationReqExtended } from "api/middleware/pagination";
import { leaderboardService } from "../services/leaderboardService";

export const leaderboardController = {
  getCourseLeaderboard: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const pagination = res.locals.pagination as PaginationReqExtended;
    const resDto: GetCourseLeaderboardRes = await leaderboardService.getCourseLeaderboard(
      authUserId,
      publicId,
      pagination
    );
    res.status(200).json(resDto);
  },

  getMyLeaderboardNearby: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { publicId } = res.locals.params as { publicId: string };
    const resDto: GetMyLeaderboardNearbyRes = await leaderboardService.getMyLeaderboardNearby(
      authUserId,
      publicId
    );
    res.status(200).json(resDto);
  },
};
