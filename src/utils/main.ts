import { FastifyInstance } from "fastify";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";

export function getServerVersion(): string {
  const { version } = JSON.parse(
    readFileSync(join(resolve(), "package.json"), { encoding: "utf-8" }),
  );
  return version;
}

//##TODO better if become a script that will be execute the github pipeline
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
