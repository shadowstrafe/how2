var moment = require('moment');

var config = require('./config');

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  VERBOSE: 3,
  DEBUG: 4
};

var currentLogLevel = LOG_LEVELS.INFO;
var configLogLevel = config.logLevel.toLowerCase();

switch (configLogLevel) {
  case 'debug':
    currentLogLevel = LOG_LEVELS.DEBUG;
    break;
  case 'verbose':
    currentLogLevel = LOG_LEVELS.VERBOSE;
    break;
  case 'warn':
    currentLogLevel = LOG_LEVELS.WARN;
    break;
  case 'error':
    currentLogLevel = LOG_LEVELS.ERROR;
    break;
}

function formatMessage (message, logLevel) {
  var nowF = moment().format('D/MMM/YY HH:mm:ss');
  return nowF + ' ' + logLevel + ' ' + message;
}

function debug (message) {
  if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    console.log(formatMessage(message, 'DEBUG'));
  }
}

function verbose (message) {
  if (currentLogLevel >= LOG_LEVELS.VERBOSE) {
    console.log(formatMessage(message, 'VERBOSE'));
  }
}

function info (message) {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    console.log(formatMessage(message, 'INFO'));
  }
}

function warn (message) {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    console.error(formatMessage(message, 'WARN'));
  }
}

function error (message) {
  console.error(formatMessage(message, 'ERROR'));
}

module.exports = {
  debug,
  verbose,
  info,
  warn,
  error
};
