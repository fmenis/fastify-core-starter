import { FastifyInstance } from "fastify";
import betterAuthPlugin from "./betterAuth.plugin.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("onRoute", options => {
    options.schema = {
      ...options.schema,
      tags: ["auth"],
    };
  });

  fastify.register(betterAuthPlugin);
}
