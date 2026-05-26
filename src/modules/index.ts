import { FastifyInstance } from "fastify";

import authentication from "../plugins/authentication.plugin.js";

import authModule from "./auth/index.js";
import miscModule from "./misc/index.js";
import accountModule from "./accounts/index.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  await fastify.register(authentication);

  await fastify.register(authModule);
  await fastify.register(miscModule);
  await fastify.register(accountModule);
}
