import { FastifyInstance } from "fastify";

import read from "./usecases/read.usecase.js";

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
