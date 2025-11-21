import { FastifyServerOptions } from "fastify";
import { stdTimeFunctions, LoggerOptions } from "pino";

export function buildServerOptions(): FastifyServerOptions {
  return {
    logger: buildLoggerOptions(),
    ajv: {
      customOptions: {
        allErrors: true,
        removeAdditional: false,
        useDefaults: true,
      },
    },
    trustProxy: true,
  };
}

function buildLoggerOptions(): LoggerOptions {
  const options: LoggerOptions = {
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
        "password",
        "oldPassword",
        "newPassword",
        "newPasswordConfirmation",
      ],
      censor: "**GDPR COMPLIANT**",
    },
  };

  return options;
}
