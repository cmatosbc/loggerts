import { LogMessage, LogContext } from './logger';

export const userContext = (logMessage: LogMessage, userContext: LogContext) => {
  logMessage.context = { ...logMessage.context, ...userContext };
  console.log(`[${logMessage.level.toUpperCase()}] ${logMessage.message} - User Context: ${JSON.stringify(logMessage.context)}`);
};
