import moment from 'moment';
import config from './config';

const enum LOG_LEVEL {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  VERBOSE = 3,
  DEBUG = 4,
}

let currentLogLevel: LOG_LEVEL;

switch (config.logLevel) {
  case 'debug':
    currentLogLevel = LOG_LEVEL.DEBUG;
    info('Log level set to DEBUG');
    break;
  case 'verbose':
    currentLogLevel = LOG_LEVEL.VERBOSE;
    info('Log level set to VERBOSE');
    break;
  case 'warn':
    currentLogLevel = LOG_LEVEL.WARN;
    break;
  case 'error':
    currentLogLevel = LOG_LEVEL.ERROR;
    break;
  default:
    currentLogLevel = LOG_LEVEL.INFO;
    info('Log level set to INFO');
    break;
}

function formatMessage(message: string, logLevel: string) {
  const nowF = moment().format('D/MMM/YY HH:mm:ss');
  return nowF + ' ' + logLevel + ' ' + message;
}

export function debug(message: any) {
  if (currentLogLevel >= LOG_LEVEL.DEBUG) {
    console.log(formatMessage(message, 'DEBUG'));
  }
}

export function verbose(message: any) {
  if (currentLogLevel >= LOG_LEVEL.VERBOSE) {
    console.log(formatMessage(message, 'VERBOSE'));
  }
}

export function info(message: any) {
  if (currentLogLevel >= LOG_LEVEL.INFO) {
    console.log(formatMessage(message, 'INFO'));
  }
}

export function warn(message: any) {
  if (currentLogLevel >= LOG_LEVEL.WARN) {
    console.error(formatMessage(message, 'WARN'));
  }
}

export function error(message: any): void {
  console.error(formatMessage(message, 'ERROR'));
}
