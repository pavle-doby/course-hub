import type {
  GenerateQuizReq,
  GenerateQuizRes,
  GetPublicQuizRes,
  GetQuizRes,
  MyQuizResponseRes,
  QuizParentParams,
  SaveQuizReq,
  SaveQuizResponseReq,
  SaveQuizRes,
} from "@repo/contract";
import type { Request, Response } from "express";
import { quizzesService } from "../services/quizzesService";

export const quizzesController = {
  getQuiz: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const parent = res.locals.params as QuizParentParams;
    const resDto: GetQuizRes = await quizzesService.getQuiz(parent, authUserId);
    res.status(200).json(resDto);
  },

  saveQuiz: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const parent = res.locals.params as QuizParentParams;
    const reqDto = res.locals.body as SaveQuizReq;
    const resDto: SaveQuizRes = await quizzesService.saveQuiz(parent, reqDto, authUserId);
    res.status(200).json(resDto);
  },

  deleteQuiz: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const parent = res.locals.params as QuizParentParams;
    await quizzesService.deleteQuiz(parent, authUserId);
    res.status(204).send();
  },

  generateQuiz: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const parent = res.locals.params as QuizParentParams;
    const reqDto = res.locals.body as GenerateQuizReq;
    const resDto: GenerateQuizRes = await quizzesService.generateQuiz(parent, reqDto, authUserId);
    res.status(200).json(resDto);
  },

  getPublicQuiz: async (_req: Request, res: Response): Promise<void> => {
    const parent = res.locals.params as QuizParentParams;
    const resDto: GetPublicQuizRes = await quizzesService.getPublicQuiz(parent);
    res.status(200).json(resDto);
  },

  getMyResponse: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const parent = res.locals.params as QuizParentParams;
    const resDto: MyQuizResponseRes = await quizzesService.getMyResponse(parent, authUserId);
    res.status(200).json(resDto);
  },

  saveMyResponse: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const parent = res.locals.params as QuizParentParams;
    const reqDto = res.locals.body as SaveQuizResponseReq;
    const resDto: MyQuizResponseRes = await quizzesService.saveMyResponse(
      parent,
      reqDto,
      authUserId
    );
    res.status(200).json(resDto);
  },

  clearMyResponse: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const parent = res.locals.params as QuizParentParams;
    await quizzesService.clearMyResponse(parent, authUserId);
    res.status(204).send();
  },
};
