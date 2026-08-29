import { Router, Request, Response } from "express";
import { lessonsController } from "../controllers/lessonsController";
import { pagination } from "api/middleware/pagination";
import { validate } from "api/middleware/validate";
import {
  LessonGetAllQuerySchema,
  LessonPostQuerySchema,
  LessonPutQuerySchema,
  ParamsIdSchema,
  SearchSchema,
} from "@repo/contract";

const router: Router = Router();

// GET /lessons → get all lessons for current user's courses
router.get(
  "/",
  pagination(),
  validate(SearchSchema, "query"),
  validate(LessonGetAllQuerySchema, "query"),
  async (req: Request, res: Response) => {
    await lessonsController.getAllLessons(req, res);
  }
);

// GET /lessons/:id → get lesson by id
router.get("/:id", validate(ParamsIdSchema, "params"), async (req: Request, res: Response) => {
  await lessonsController.getLesson(req, res);
});

// POST /lessons → create lesson
router.post("/", validate(LessonPostQuerySchema), async (req: Request, res: Response) => {
  await lessonsController.createLesson(req, res);
});

// PUT /lessons/:id → update lesson
router.put(
  "/:id",
  validate(ParamsIdSchema, "params"),
  validate(LessonPutQuerySchema),
  async (req: Request, res: Response) => {
    await lessonsController.updateLesson(req, res);
  }
);

// DELETE /lessons/:id → delete lesson
router.delete("/:id", validate(ParamsIdSchema, "params"), async (req: Request, res: Response) => {
  await lessonsController.deleteLesson(req, res);
});

export default router;
