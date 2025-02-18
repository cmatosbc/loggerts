import { createLogger, LogMessage } from './logger';

const logger = createLogger({
  outputStream: process.stdout,
  logLevel: 'info',
});

let logging = false;

export const startLogging = () => {
  logging = true;
  process.on('beforeExit', logCommand);
};

export const stopLogging = () => {
  logging = false;
  process.removeListener('beforeExit', logCommand);
};

const logCommand = (code: number) => {
  if (!logging) return;

  const command = process.argv.slice(2).join(' ');
  if (/node|\.js/.test(command)) {
    const logMessage: LogMessage = {
      level: 'info',
      message: `Command executed: ${command}`,
    };
    logger.log(logMessage);
  }
};
