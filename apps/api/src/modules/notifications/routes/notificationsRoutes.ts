import { Router, type Request, type Response } from "express";
import {
  SubscribeNotificationsBodySchema,
  UnsubscribeNotificationsBodySchema,
} from "@repo/contract";
import { validate } from "api/middleware/validate";
import { notificationsController } from "../controllers/notificationsController";

const router: Router = Router();

// POST /notifications/subscribe → subscribe the current device to a course notification category
router.post(
  //
  "/subscribe",
  validate(SubscribeNotificationsBodySchema),
  async (req: Request, res: Response) => {
    await notificationsController.subscribe(req, res);
  }
);

// DELETE /notifications/subscribe → unsubscribe the current device from a course notification category
router.delete(
  //
  "/subscribe",
  validate(UnsubscribeNotificationsBodySchema),
  async (req: Request, res: Response) => {
    await notificationsController.unsubscribe(req, res);
  }
);

export default router;
