import { LogMessage, LogContext } from './logger';

export const environmentContext = (logMessage: LogMessage, envContext: LogContext) => {
  logMessage.context = { ...logMessage.context, ...envContext };
  console.log(`[${logMessage.level.toUpperCase()}] ${logMessage.message} - Environment Context: ${JSON.stringify(logMessage.context)}`);
};
