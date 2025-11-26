import { FastifyServerOptions } from "fastify";

import { loggerOptions } from "../lib/logger.js";

//TODO
// import addFormatsPkg from "ajv-formats";
// const addFormats = addFormatsPkg as unknown as (ajv: any) => void;

export function buildServerOptions(): FastifyServerOptions {
  return {
    logger: loggerOptions,
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
