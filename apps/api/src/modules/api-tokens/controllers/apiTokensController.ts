import type { Request, Response } from "express";
import type { CreateApiTokenReq, CreateApiTokenRes, GetApiTokensRes } from "@repo/contract";
import { apiTokensService } from "../services/apiTokensService";

export const apiTokensController = {
  getTokens: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const tokens: GetApiTokensRes = await apiTokensService.getTokens(authUserId);
    res.status(200).json(tokens);
  },

  createToken: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const reqDto = res.locals.body as CreateApiTokenReq;
    const resDto: CreateApiTokenRes = await apiTokensService.createToken(authUserId, reqDto);
    res.status(201).json(resDto);
  },

  revokeToken: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const { id } = res.locals.params as { id: string };
    await apiTokensService.revokeToken(id, authUserId);
    res.status(204).send();
  },
};
