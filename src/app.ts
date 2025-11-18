import { FastifyInstance } from "fastify";
import openApiPlugin from "./plugins/openApi.plugin.js";

export default async function app(fastify: FastifyInstance): Promise<void> {
  await fastify.register(openApiPlugin);
}
