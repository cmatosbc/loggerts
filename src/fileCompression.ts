import { LogMessage } from './logger';
import * as fs from 'fs';
import * as zlib from 'zlib';

export const fileCompression = (logMessage: LogMessage, filePath: string) => {
  const logData = JSON.stringify(logMessage) + '\n';
  fs.appendFileSync(filePath, logData);

  const stats = fs.statSync(filePath);
  if (stats.size > 1024 * 1024) { // Compress if file size > 1MB
    const gzip = zlib.createGzip();
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(`${filePath}.gz`);

    input.pipe(gzip).pipe(output).on('finish', () => {
      fs.unlinkSync(filePath);
    });
  }
};
