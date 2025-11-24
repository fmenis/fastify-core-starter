import pino, { Logger, LoggerOptions, stdTimeFunctions } from "pino";

export const loggerOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL,
  timestamp: () => stdTimeFunctions.isoTime(),
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  base: undefined,
  redact: {
    paths: [
      "body.password",
      "body.oldPassword",
      "body.newPassword",
      "body.newPasswordConfirmation",
    ],
    censor: "**GDPR COMPLIANT**",
  },
};

export const loggerInstance: Logger = pino(loggerOptions);
