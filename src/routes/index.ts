import { FastifyInstance } from "fastify";

import authRoutes from "./auth/index.js";
import accountRepository from "./accounts/account.repository.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  // repositories must be available for all routes
  await fastify.register(accountRepository);

  await fastify.register(authRoutes);
}
