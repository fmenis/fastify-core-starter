import { FastifyInstance } from "fastify";

import authentication from "../plugins/authentication.plugin.js";

import accountRepository from "./accounts/account.repository.js";

import authRoutes from "./auth/index.js";
import miscRoutes from "./misc/index.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  await fastify.register(authentication);

  // repositories must be available for all routes
  await fastify.register(accountRepository);

  await fastify.register(authRoutes);

  await fastify.register(miscRoutes);
}
