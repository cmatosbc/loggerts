import { LogMessage } from './logger';

const rateLimitMap: Record<string, number> = {
  emergency: 1000,
  alert: 2000,
  critical: 3000,
  error: 4000,
  warning: 5000,
  notice: 6000,
  info: 7000,
  debug: 8000,
};

const lastLogTimeMap: Record<string, number> = {};

export const rateLimiting = (logMessage: LogMessage) => {
  const now = Date.now();
  const lastLogTime = lastLogTimeMap[logMessage.level] || 0;
  const limit = rateLimitMap[logMessage.level] || 1000;

  if (now - lastLogTime >= limit) {
    console.log(`[${logMessage.level.toUpperCase()}] ${logMessage.message}`);
    lastLogTimeMap[logMessage.level] = now;
  }
};
