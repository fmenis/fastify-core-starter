import { FastifyInstance } from "fastify";

import authentication from "../plugins/authentication.plugin.js";

import accountRepository from "./accounts/account.repository.js";
import accountService from "./accounts/account.service.js";

import authModule from "./auth/index.js";
import miscModule from "./misc/index.js";
import accountModule from "./accounts/index.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  await fastify.register(authentication);

  // services and repositories must be available for all routes
  await fastify.register(accountRepository);
  await fastify.register(accountService);

  await fastify.register(authModule);
  await fastify.register(miscModule);
  await fastify.register(accountModule);
}
