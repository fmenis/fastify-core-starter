import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import helmet from "@fastify/helmet";

import knexPlugin from "./plugins/knex.plugin.js";

export default async function app(fastify: FastifyInstance): Promise<void> {
  fastify.register(cors);
  fastify.register(sensible);
  fastify.register(helmet);

  await fastify.register(knexPlugin);
}
