import { LogMessage } from './logger';
import * as fs from 'fs';
import * as path from 'path';

export const logRotation = (logMessage: LogMessage, filePath: string) => {
  const logData = JSON.stringify(logMessage) + '\n';
  fs.appendFileSync(filePath, logData);

  const stats = fs.statSync(filePath);
  if (stats.size > 1024 * 1024) { // Rotate if file size > 1MB
    const rotatedPath = `${filePath}.${Date.now()}`;
    fs.renameSync(filePath, rotatedPath);
  }
};
