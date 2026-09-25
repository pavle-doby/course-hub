import type { Request, Response } from "express";
import type {
  GetNotificationPreferencesRes,
  GetNotificationsReq,
  GetNotificationsRes,
  SubscribeNotificationsReq,
  UnsubscribeNotificationsReq,
} from "@repo/contract";
import type { PaginationReqExtended } from "api/middleware/pagination";
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

  getPreferences: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const preferences: GetNotificationPreferencesRes =
      await notificationsService.getPreferences(authUserId);
    res.status(200).json(preferences);
  },

  getNotifications: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    const dto: GetNotificationsReq<PaginationReqExtended> = res.locals.pagination;
    const notifications: GetNotificationsRes = await notificationsService.getNotifications(
      authUserId,
      dto
    );
    res.status(200).json(notifications);
  },

  markAllRead: async (_req: Request, res: Response): Promise<void> => {
    const authUserId: string = res.locals.user.id;
    await notificationsService.markAllRead(authUserId);
    res.status(204).send();
  },
};
