import { FastifyInstance } from "fastify";

import status from "./usecases/status.usecase.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("onRoute", options => {
    options.schema = {
      ...options.schema,
      tags: ["misc"],
    };
  });

  fastify.register(status);
}
