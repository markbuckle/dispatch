import { createLogger, format, transports } from 'winston';

// json rather than a pretty line, because these are read in a hosted log viewer, not a terminal
export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});
