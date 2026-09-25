import { Router, type Request, type Response } from "express";
import {
  SubscribeNotificationsBodySchema,
  UnsubscribeNotificationsBodySchema,
} from "@repo/contract";
import { validate } from "api/middleware/validate";
import { pagination } from "api/middleware/pagination";
import { notificationsController } from "../controllers/notificationsController";

const router: Router = Router();

// GET /notifications → paginated notification history for the current user, newest first
router.get(
  //
  "/",
  pagination(),
  async (req: Request, res: Response) => {
    await notificationsController.getNotifications(req, res);
  }
);

// GET /notifications/preferences → categories the current user enabled for all courses
router.get(
  //
  "/preferences",
  async (req: Request, res: Response) => {
    await notificationsController.getPreferences(req, res);
  }
);

// POST /notifications/read → mark all of the current user's notifications read
router.post(
  //
  "/read",
  async (req: Request, res: Response) => {
    await notificationsController.markAllRead(req, res);
  }
);

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
