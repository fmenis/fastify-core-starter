import { FastifyInstance } from "fastify";

import {
  buildRouteFullDescription,
  getServerVersion,
} from "../../../utils/utils.js";
import {
  healthResponseSchema,
  HealthResponseSchemaType,
} from "../misc.schema.js";

export default async function health(fastify: FastifyInstance): Promise<void> {
  fastify.route({
    url: "/health",
    method: "GET",
    config: {
      public: true,
      disableVersioning: true,
    },
    schema: {
      description: buildRouteFullDescription({
        api: "health",
        description: "Get service health.",
        errors: [],
      }),
      response: {
        200: healthResponseSchema,
      },
    },
    handler: onHealth,
  });

  async function onHealth(): Promise<HealthResponseSchemaType> {
    return { health: "ok", version: await getServerVersion() };
  }
}
