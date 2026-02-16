import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Account } from "./account.interface.js";

declare module "fastify" {
  interface FastifyInstance {
    accountService: ReturnType<typeof accountService>;
  }
}

export function accountService(fastify: FastifyInstance) {
  const { accountRepository } = fastify;

  return {
    async findAccount(accountId: string): Promise<Account | null> {
      return accountRepository.findById(accountId);
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
