import pino from "pino";
import { devPrettyTransport } from "./transports";
import { env } from "api/env";

const isDevelopment = env.NODE_ENV === "development";

export const logger = pino({
  level: env.MIN_LOG_LEVEL || "info",
  redact: ["req.headers.cookie", "res.headers['set-cookie']"],
  transport: isDevelopment ? { targets: [devPrettyTransport] } : undefined,
});
