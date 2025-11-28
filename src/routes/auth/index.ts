import { FastifyInstance } from "fastify";

import login from "./usecases/login.usecase.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("onRoute", options => {
    options.schema = {
      ...options.schema,
      tags: ["auth"],
    };
  });

  const prefix = "/auth";
  fastify.register(login, { prefix });
}
