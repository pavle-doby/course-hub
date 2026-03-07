import { white } from 'api/utils/consoleColors';

export const fileTransport = {
  target: 'pino/file',
  options: { destination: 'logs/app.log', mkdir: true },
};

export const prettyTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss',
  },
};

export const devPrettyTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'HH:MM:ss Z',
    ignore: 'req,res,responseTime,pid,hostname',
    messageFormat: `{req.method} {req.url} ({res.statusCode}) ${white('responseTime: {responseTime}ms')} - {msg}`,
  },
};
