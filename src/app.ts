import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import bullmqPlugin from "./plugins/bullmq.plugin.js";
import loadCommonSchemasPlugin from "./plugins/loadCommonSchemas.plugin.js";
import apiPlugin from "./routes/index.js";
import commonClientErrorsPlugin from "./plugins/commonClientErrors.plugin.js";
import commonHooksPlugin from "./plugins/commonHooks.plugin.js";
import prismaPlugin from "./plugins/prisma.plugin.js";

export default async function app(fastify: FastifyInstance): Promise<void> {
  fastify.register(cors);
  fastify.register(sensible);
  fastify.register(helmet);
  fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  await fastify.register(prismaPlugin);
  await fastify.register(bullmqPlugin);
  await fastify.register(loadCommonSchemasPlugin);
  await fastify.register(commonClientErrorsPlugin);
  await fastify.register(commonHooksPlugin);

  await fastify.register(apiPlugin, { prefix: "/api" });
}
