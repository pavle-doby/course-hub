import { Router, Request, Response } from "express";
import { validate } from "api/middleware/validate";
import { QuizParentParamsSchema } from "@repo/contract";
import { quizzesController } from "../controllers/quizzesController";

const router: Router = Router();

// GET /public/quizzes/:parentType/:parentId → quiz without correct answers, or null, no auth required
router.get(
  //
  "/:parentType/:parentId",
  validate(QuizParentParamsSchema, "params"),
  async (req: Request, res: Response) => {
    await quizzesController.getPublicQuiz(req, res);
  }
);

export default router;
