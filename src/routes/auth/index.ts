import { FastifyInstance } from "fastify";

import login from "./usecases/login.usecase.js";
import authProducer from "./queue/auth.producer.js";
import authConsumer from "./queue/auth.consumer.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("onRoute", options => {
    options.schema = {
      ...options.schema,
      tags: ["auth"],
    };
  });

  fastify.register(authProducer);
  fastify.register(authConsumer);

  const prefix = "/v1/auth";
  fastify.register(login, { prefix });
}
