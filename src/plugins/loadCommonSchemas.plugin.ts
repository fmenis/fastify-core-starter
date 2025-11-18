import fp from "fastify-plugin";

import { FastifyInstance } from "fastify";
import {
  noContentSchema,
  acceptedSchema,
  notFoundSchema,
  badRequestSchema,
  unauthorizedSchema,
  forbiddenSchema,
  conflictSchema,
  internalServerErrorSchema,
} from "../common/schema.js";

async function loadCommonSchemasPlugin(fastify: FastifyInstance) {
  fastify.addSchema(noContentSchema);
  fastify.addSchema(acceptedSchema);
  fastify.addSchema(notFoundSchema);
  fastify.addSchema(badRequestSchema);
  fastify.addSchema(unauthorizedSchema);
  fastify.addSchema(forbiddenSchema);
  fastify.addSchema(conflictSchema);
  fastify.addSchema(internalServerErrorSchema);
}

export default fp(loadCommonSchemasPlugin);
