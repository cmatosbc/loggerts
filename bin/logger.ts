import { format } from 'date-fns';
import { Writable } from 'stream';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { getBrowserInfo, getDeviceInfo } from './utils';

type LogLevel = 'emergency' | 'alert' | 'critical' | 'error' | 'warning' | 'notice' | 'info' | 'debug';

type LogContext = Record<string, any>;

type LogMessage = {
  level: LogLevel;
  message: string;
  context?: LogContext;
  file?: string | null;
  line?: number | null;
  code?: number | string | null;
  trace?: string | null;
  tags?: string[];
};

type LoggerOptions = {
  outputStream?: Writable;
  dateFormat?: string;
  logLevel?: LogLevel;
  messageFormat?: string;
  storeLogsInLocalStorage?: boolean;
  postLogsOnUnload?: boolean;
  logStorageKey?: string;
  postCallback?: (logMessages: LogMessage[]) => void;
  logToFile?: {
    filePath: string;
    maxSize?: number; // Max size in bytes before rotating
  };
  bufferSize?: number;
  flushInterval?: number;
};

type Logger = {
  log: (logMessage: LogMessage) => void;
  emergency: (message: string, context?: LogContext) => void;
  alert: (message: string, context?: LogContext) => void;
  critical: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  warning: (message: string, context?: LogContext) => void;
  notice: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
  featureLog: (chance: number, logMessage: LogMessage) => void;
  conditionalLog: (condition: () => boolean, logMessage: LogMessage) => void;
  bufferLog: (logMessage: LogMessage) => void;
  flushBuffer: () => void;
  throttledLog: (logMessage: LogMessage, interval: number) => void;
  webSocketLog: (webSocketMessage: string, context?: LogContext) => void;
  browserLog: (logMessage: LogMessage) => void;
  deviceLog: (logMessage: LogMessage) => void;
};

const logLevels: LogLevel[] = ['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug'];

const createLogger = (options?: LoggerOptions): Logger => {
  const {
    outputStream = process.stdout,
    dateFormat = 'yyyy-MM-dd HH:mm:ss',
    logLevel = 'debug',
    messageFormat = '[{timestamp}] [{level}] {message}',
    storeLogsInLocalStorage = false,
    postLogsOnUnload = false,
    logStorageKey = 'logMessages',
    postCallback,
    logToFile,
    bufferSize = 10,
    flushInterval = 5000,
  } = options || {};

  let buffer: LogMessage[] = [];
  let lastLogTime = 0;

  const asyncLog = async (logMessage: LogMessage) => {
    const { level, message, context, file, line, code, trace, tags } = logMessage;
    if (logLevels.indexOf(level) <= logLevels.indexOf(logLevel)) {
      const timestamp = format(new Date(), dateFormat);
      let formattedMessage = messageFormat
        .replace('{timestamp}', timestamp)
        .replace('{level}', level.toUpperCase())
        .replace('{message}', message);

      if (context) {
        formattedMessage += ` ${JSON.stringify(context)}`;
      }
      if (file) {
        formattedMessage += ` | File: ${file}`;
      }
      if (line !== undefined && line !== null) {
        formattedMessage += ` | Line: ${line}`;
      }
      if (code !== undefined && code !== null) {
        formattedMessage += ` | Code: ${code}`;
      }
      if (trace) {
        formattedMessage += ` | Trace: ${trace}`;
      }
      if (tags) {
        formattedMessage += ` | Tags: ${tags.join(', ')}`;
      }

      outputStream.write(`${formattedMessage}\n`);

      if (logToFile) {
        const { filePath, maxSize } = logToFile;
        if (maxSize && fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > maxSize) {
            fs.renameSync(filePath, `${filePath}.${Date.now()}`);
          }
        }
        fs.appendFileSync(filePath, `${formattedMessage}\n`);
      }

      if (storeLogsInLocalStorage) {
        const storedLogs = JSON.parse(localStorage.getItem(logStorageKey) || '[]');
        storedLogs.push(logMessage);
        localStorage.setItem(logStorageKey, JSON.stringify(storedLogs));
      }

      if (postCallback && !storeLogsInLocalStorage) {
        await postCallback([logMessage]);
      }
    }
  };

  if (postLogsOnUnload && storeLogsInLocalStorage) {
    window.addEventListener('beforeunload', async () => {
      const storedLogs = JSON.parse(localStorage.getItem(logStorageKey) || '[]');
      if (storedLogs.length > 0) {
        await postCallback(storedLogs);
        localStorage.removeItem(logStorageKey);
      }
    });
  }

  const featureLog = (chance: number, logMessage: LogMessage) => {
    if (Math.random() <= chance) {
      asyncLog(logMessage);
    }
  };

  const conditionalLog = (condition: () => boolean, logMessage: LogMessage) => {
    if (condition()) {
      asyncLog(logMessage);
    }
  };

  const bufferLog = (logMessage: LogMessage) => {
    buffer.push(logMessage);
    if (buffer.length >= bufferSize) {
      flushBuffer();
    }
  };

  const flushBuffer = () => {
    buffer.forEach(asyncLog);
    buffer = [];
  };

  setInterval(flushBuffer, flushInterval);

  const throttledLog = (logMessage: LogMessage, interval: number) => {
    const now = Date.now();
    if (now - lastLogTime >= interval) {
      asyncLog(logMessage);
      lastLogTime = now;
    }
  };

  const webSocketLog = (webSocketMessage: string, context?: LogContext) => {
    asyncLog({ level: 'info', message: `WebSocket: ${webSocketMessage}`, context });
  };

  const browserLog = (logMessage: LogMessage) => {
    const browserInfo = getBrowserInfo();
    logMessage.message = `Browser: ${browserInfo} | ${logMessage.message}`;
    asyncLog(logMessage);
  };

  const deviceLog = (logMessage: LogMessage) => {
    const deviceInfo = getDeviceInfo();
    logMessage.message = `Device: ${deviceInfo} | ${logMessage.message}`;
    asyncLog(logMessage);
  };

  return {
    log: asyncLog,
    emergency: (message, context) => asyncLog({ level: 'emergency', message, context }),
    alert: (message, context) => asyncLog({ level: 'alert', message, context }),
    critical: (message, context) => asyncLog({ level: 'critical', message, context }),
    error: (message, context) => asyncLog({ level: 'error', message, context }),
    warning: (message, context) => asyncLog({ level: 'warning', message, context }),
    notice: (message, context) => asyncLog({ level: 'notice', message, context }),
    info: (message, context) => asyncLog({ level: 'info', message, context }),
    debug: (message, context) => asyncLog({ level: 'debug', message, context }),
    featureLog,
    conditionalLog,
    bufferLog,
    flushBuffer,
    throttledLog,
    webSocketLog,
    browserLog,
    deviceLog,
  };
};

export { createLogger, LogLevel, LogContext, LogMessage, Logger };
