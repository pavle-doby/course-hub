import { Router, Request, Response } from "express";
import { topicsController } from "../controllers/topicsController";
import { pagination } from "api/middleware/pagination";
import { validate } from "api/middleware/validate";
import {
  TopicGetAllQuerySchema,
  TopicPostQuerySchema,
  TopicPutQuerySchema,
  ParamsIdSchema,
  SearchSchema,
} from "@repo/contract";

const router: Router = Router();

// GET /topics → get all topics for current user's courses
router.get(
  "/",
  pagination(),
  validate(SearchSchema, "query"),
  validate(TopicGetAllQuerySchema, "query"),
  async (req: Request, res: Response) => {
    await topicsController.getAllTopics(req, res);
  }
);

// GET /topics/:id → get topic by id
router.get("/:id", validate(ParamsIdSchema, "params"), async (req: Request, res: Response) => {
  await topicsController.getTopic(req, res);
});

// POST /topics → create topic
router.post("/", validate(TopicPostQuerySchema), async (req: Request, res: Response) => {
  await topicsController.createTopic(req, res);
});

// PUT /topics/:id → update topic
router.put(
  "/:id",
  validate(ParamsIdSchema, "params"),
  validate(TopicPutQuerySchema),
  async (req: Request, res: Response) => {
    await topicsController.updateTopic(req, res);
  }
);

// DELETE /topics/:id → delete topic
router.delete("/:id", validate(ParamsIdSchema, "params"), async (req: Request, res: Response) => {
  await topicsController.deleteTopic(req, res);
});

export default router;
