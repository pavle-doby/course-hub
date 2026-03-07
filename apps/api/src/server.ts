import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './env';
import { green } from './utils/consoleColors';
import { handleError, handleErrorNotFound } from './middleware/error';
import { logger, handleLogs } from './logger';

import apiRoutes from './routes/apiRoutes';

const app = express();

app.use(
  cors({
    origin: env.CORS_ENABLED_URL,
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(handleLogs);

app.use('/api', apiRoutes);

// Error handling middlewares (should be last!!!)
app.use(handleErrorNotFound);
app.use(handleError);

const PORT = Number(env.SERVER_PORT);

app.listen(PORT, () =>
  console.log(`[${green('Server')}] Running on: http://localhost:${PORT}`)
);

process.on('uncaughtException', (error) => {
  logger.fatal(error, 'uncaught exception detected');
});
