import { z } from "zod";
import { SubscribeNotificationsBodySchema, UnsubscribeNotificationsBodySchema } from "./schemas";

export type SubscribeNotificationsReq = z.infer<typeof SubscribeNotificationsBodySchema>;
export type UnsubscribeNotificationsReq = z.infer<typeof UnsubscribeNotificationsBodySchema>;
