import { FastifyInstance } from "fastify";
import { readFile } from "fs/promises";
import { resolve, join } from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";
import { DocumentationError } from "../common/interface.js";
import { AppMode } from "../common/enum.js";

export function resolveAppMode(): AppMode {
  const mode = process.env.APP_MODE;

  if (!mode) {
    console.error("APP_MODE environment variable is required (http | worker)");
    process.exit(1);
  }

  if (!Object.values(AppMode).includes(mode as AppMode)) {
    console.error(
      `Unknown APP_MODE: "${mode}". Must be one of: ${Object.values(AppMode).join(" | ")}`,
    );
    process.exit(1);
  }

  return mode as AppMode;
}

export async function getServerVersion(): Promise<string> {
  const content = await readFile(join(resolve(), "package.json"), {
    encoding: "utf-8",
  });
  const { version } = JSON.parse(content);
  return version;
}

//TODO better if become a script that will be execute the github pipeline
export async function validateOpenApi(fastify: FastifyInstance): Promise<void> {
  const spec = fastify.swagger();
  try {
    await SwaggerParser.validate(spec);
    fastify.log.debug("OpenAPI schema is valid");
  } catch (err) {
    fastify.log.error("OpenAPI validation failed");
    throw err;
  }
}

export function buildRouteFullDescription(params: {
  api: string;
  description: string;
  version?: string;
  errors?: DocumentationError[];
  permission?: string;
}): string {
  const { description, version, errors = [], api, permission } = params;

  let fullDescription = `${description} \n\n `;
  const apiErrors = errors.filter(item => item.apis.includes(api));

  fullDescription += version
    ? `**Version**: ${version}. \n\n`
    : `**This api is not versioned.** \n\n`;

  if (apiErrors.length > 0) {
    const formattedErrors = apiErrors
      .map(
        item => `- ${item.statusCode} - ${item.code}: ${item.description} \n\n`,
      )
      .sort();

    fullDescription += ` **Custom errors**: \n\n ${formattedErrors.join(" ")}`;
  } else {
    fullDescription += ` **This api doesn't expose custom errors.** \n\n`;
  }

  fullDescription += permission
    ? `**Required permission**: *${permission}*.`
    : `**No permission required to consume the api**.`;

  return fullDescription;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trimObjectFields(fields: any[], obj: any) {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value && fields.includes(key)) {
      if (Array.isArray(value)) {
        obj[key] = value.map(item => item.trim());
      } else {
        obj[key] = obj[key].trim();
      }
    }
  }
  return obj;
}
