import { LogMessage } from './logger';
import chalk from 'chalk';

const colorMap: Record<string, chalk.Chalk> = {
  emergency: chalk.red.bold,
  alert: chalk.red,
  critical: chalk.magenta,
  error: chalk.red,
  warning: chalk.yellow,
  notice: chalk.blue,
  info: chalk.green,
  debug: chalk.gray,
};

export const consoleColorCoding = (logMessage: LogMessage) => {
  const color = colorMap[logMessage.level] || chalk.white;
  console.log(color(`[${logMessage.level.toUpperCase()}] ${logMessage.message}`));
};
