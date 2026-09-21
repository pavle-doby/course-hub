import type { Request, Response } from "express";
import type { SubscribeNotificationsReq, UnsubscribeNotificationsReq } from "@repo/contract";
import { notificationsService } from "../services/notificationsService";

export const notificationsController = {
  subscribe: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const dto = res.locals.body as SubscribeNotificationsReq;
    await notificationsService.subscribe(authUserId, dto);
    res.status(204).send();
  },

  unsubscribe: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const dto = res.locals.body as UnsubscribeNotificationsReq;
    await notificationsService.unsubscribe(authUserId, dto);
    res.status(204).send();
  },
};
