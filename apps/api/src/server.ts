import express from "express";
import cors from "cors";

import { env } from "./env";
import { green } from "./utils/consoleColors";
import { handleError, handleErrorNotFound } from "./middleware/error";
import { handleAuth } from "./middleware/auth";
import { handleRawBody } from "./middleware/rawBody";
import { logger, handleLogs } from "./logger";

import apiRoutes from "./routes/apiRoutes";
import apiPublicRoutes from "./routes/apiPublicRoutes";
import apixRoutes from "./routes/apixRoutes";

const app: express.Express = express();

app.use(
  cors({
    origin: (env.CORS_ENABLED_URL || "").split(","),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/v1/public/videos/webhook", handleRawBody);
app.use(express.json());
app.use(handleLogs);

// `/apix` → routes used by external systems, outside the Supabase JWT `handleAuth`
app.use("/apix", apixRoutes);

app.use("/api", apiPublicRoutes);
app.use("/api", handleAuth, apiRoutes);

// Error handling middlewares (should be last!!!)
app.use(handleErrorNotFound);
app.use(handleError);

const PORT = Number(env.PORT ?? env.SERVER_PORT);

app.listen(
  //
  PORT,
  () => console.log(`[${green("Server")}] Running on: http://localhost:${PORT}`)
);

process.on("uncaughtException", (error) => {
  logger.fatal(error, "uncaught exception detected");
});

export default app;
