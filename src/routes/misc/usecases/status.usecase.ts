import { FastifyInstance } from "fastify";

import {
  buildRouteFullDescription,
  getServerVersion,
} from "../../../utils/main.js";
import {
  statusResponseSchema,
  StatusResponseSchemaType,
} from "../misc.schema.js";

export default async function status(fastify: FastifyInstance) {
  fastify.route({
    url: "/status",
    method: "GET",
    config: {
      disableVersioning: true,
    },
    schema: {
      description: buildRouteFullDescription({
        api: "status",
        description: "Get service status.",
        errors: [],
      }),
      response: {
        200: statusResponseSchema,
      },
    },
    handler: onStatus,
  });

  async function onStatus(): Promise<StatusResponseSchemaType> {
    return { status: "ok", version: await getServerVersion() };
  }
}
