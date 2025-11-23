import { FastifyServerOptions } from "fastify";

import { stdTimeFunctions, LoggerOptions } from "pino";

//##TODO
// import addFormatsPkg from "ajv-formats";
// const addFormats = addFormatsPkg as unknown as (ajv: any) => void;

export function buildServerOptions(): FastifyServerOptions {
  return {
    logger: buildLoggerOptions(),
    ajv: {
      customOptions: {
        allErrors: true,
        removeAdditional: false,
        useDefaults: true,
      },
      // plugins: [addFormats],
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
        "body.password",
        "body.oldPassword",
        "body.newPassword",
        "body.newPasswordConfirmation",
      ],
      censor: "**GDPR COMPLIANT**",
    },
  };

  return options;
}
