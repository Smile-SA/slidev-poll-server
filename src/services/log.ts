export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
}

const debug = process.env.DEBUG ?? LogLevel.ERROR;

export function log(message: unknown, logLevel = LogLevel.INFO, force = false) {
  if (
    force ||
    debug === LogLevel.INFO ||
    debug === logLevel ||
    (debug === LogLevel.WARN && logLevel === LogLevel.ERROR)
  ) {
    if (logLevel === LogLevel.ERROR) {
      console.error(message);
    } else if (logLevel === LogLevel.WARN) {
      console.warn(message);
    } else {
      console.log(message);
    }
  }
}
