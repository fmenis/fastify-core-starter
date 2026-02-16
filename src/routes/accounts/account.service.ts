import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { Account } from "./account.interface.js";
import { EntityNotFoundError } from "../../common/errors.js";

declare module "fastify" {
  interface FastifyInstance {
    accountService: ReturnType<typeof accountService>;
  }
}

export function accountService(fastify: FastifyInstance) {
  const { accountRepository } = fastify;

  return {
    async findAccount(accountId: string): Promise<Account> {
      const account = await accountRepository.findById(accountId);

      if (!account) {
        throw new EntityNotFoundError("account", accountId);
      }

      return account;
    },
  };
}

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    const service = accountService(fastify);
    fastify.decorate("accountService", service);
  },
  {
    name: "account-service",
    dependencies: ["account-repository"],
  },
);
