import { FastifyInstance } from "fastify";

import read from "./routes/read.route.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("onRoute", options => {
    options.schema = {
      ...options.schema,
      tags: ["profile"],
    };
  });

  const prefix = "/profile";
  fastify.register(read, { prefix });
}
