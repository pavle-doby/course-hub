import { Router, Request, Response } from "express";
import { validate } from "api/middleware/validate";
import {
  GenerateQuizBodySchema,
  QuizParentParamsSchema,
  SaveQuizBodySchema,
  SaveQuizResponseBodySchema,
} from "@repo/contract";
import { quizzesController } from "../controllers/quizzesController";

const router: Router = Router();

// GET /quizzes/:parentType/:parentId → creator view with correct answers, or null
router.get(
  //
  "/:parentType/:parentId",
  validate(QuizParentParamsSchema, "params"),
  async (req: Request, res: Response) => {
    await quizzesController.getQuiz(req, res);
  }
);

// PUT /quizzes/:parentType/:parentId → course creator creates or replaces the quiz
router.put(
  //
  "/:parentType/:parentId",
  validate(QuizParentParamsSchema, "params"),
  validate(SaveQuizBodySchema),
  async (req: Request, res: Response) => {
    await quizzesController.saveQuiz(req, res);
  }
);

// DELETE /quizzes/:parentType/:parentId → course creator deletes the quiz
router.delete(
  //
  "/:parentType/:parentId",
  validate(QuizParentParamsSchema, "params"),
  async (req: Request, res: Response) => {
    await quizzesController.deleteQuiz(req, res);
  }
);

// POST /quizzes/:parentType/:parentId/generate → AI draft for the creator, nothing saved
router.post(
  //
  "/:parentType/:parentId/generate",
  validate(QuizParentParamsSchema, "params"),
  validate(GenerateQuizBodySchema),
  async (req: Request, res: Response) => {
    await quizzesController.generateQuiz(req, res);
  }
);

// GET /quizzes/:parentType/:parentId/response → current user's saved answers + result, or null
router.get(
  //
  "/:parentType/:parentId/response",
  validate(QuizParentParamsSchema, "params"),
  async (req: Request, res: Response) => {
    await quizzesController.getMyResponse(req, res);
  }
);

// PUT /quizzes/:parentType/:parentId/response → enrolled learner saves their answers
router.put(
  //
  "/:parentType/:parentId/response",
  validate(QuizParentParamsSchema, "params"),
  validate(SaveQuizResponseBodySchema),
  async (req: Request, res: Response) => {
    await quizzesController.saveMyResponse(req, res);
  }
);

// DELETE /quizzes/:parentType/:parentId/response → clear the current user's answers
router.delete(
  //
  "/:parentType/:parentId/response",
  validate(QuizParentParamsSchema, "params"),
  async (req: Request, res: Response) => {
    await quizzesController.clearMyResponse(req, res);
  }
);

export default router;
