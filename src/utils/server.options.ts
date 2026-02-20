import { FastifyServerOptions } from "fastify";
import addFormatsPkg from "ajv-formats";

import { loggerOptions } from "../lib/logger.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addFormats = addFormatsPkg as unknown as (ajv: any) => any;

export function buildServerOptions(): FastifyServerOptions {
  return {
    logger: loggerOptions,
    ajv: {
      customOptions: {
        allErrors: true,
        removeAdditional: false,
        useDefaults: true,
        coerceTypes: false,
      },
      plugins: [addFormats],
    },
    trustProxy: true,
  };
}
