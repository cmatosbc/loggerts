import { LogMessage } from './logger';
import * as syslog from 'modern-syslog';

syslog.open('my-app', syslog.option.PID | syslog.option.ODELAY, syslog.facility.USER);

const levelMap: Record<string, syslog.level> = {
  emergency: syslog.level.EMERG,
  alert: syslog.level.ALERT,
  critical: syslog.level.CRIT,
  error: syslog.level.ERR,
  warning: syslog.level.WARNING,
  notice: syslog.level.NOTICE,
  info: syslog.level.INFO,
  debug: syslog.level.DEBUG,
};

export const syslogIntegration = (logMessage: LogMessage) => {
  const level = levelMap[logMessage.level] || syslog.level.INFO;
  syslog.log(level, logMessage.message);
};
