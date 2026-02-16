import { FastifyInstance } from "fastify";

import authentication from "../plugins/authentication.plugin.js";

import accountRepository from "./accounts/account.repository.js";
import accountService from "./accounts/account.service.js";

import accountsRoutes from "./accounts/index.js";
import authRoutes from "./auth/index.js";
import miscRoutes from "./misc/index.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  await fastify.register(authentication);

  // services and repositories must be available for all routes
  await fastify.register(accountRepository);
  await fastify.register(accountService);

  await fastify.register(authRoutes);
  await fastify.register(miscRoutes);
  await fastify.register(accountsRoutes);
}
