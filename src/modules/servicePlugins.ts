import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import activityLogService from "./activityLog/activityLog.service.js";
import accountRepository from "./accounts/account.repository.js";
import accountService from "./accounts/account.service.js";

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    await fastify.register(activityLogService);
    await fastify.register(accountRepository);
    await fastify.register(accountService);
  },
  {
    name: "service-plugins",
    dependencies: ["kysely"],
  },
);
