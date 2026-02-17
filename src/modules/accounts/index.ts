import { FastifyInstance } from "fastify";

import read from "./routes/read.route.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("onRoute", options => {
    options.schema = {
      ...options.schema,
      tags: ["accounts"],
    };
  });

  const prefix = "/accounts";
  fastify.register(read, { prefix });
}
