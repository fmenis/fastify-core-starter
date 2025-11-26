import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Account, CreateAccount } from "./account.interface.js";

declare module "fastify" {
  interface FastifyInstance {
    accountRepository: ReturnType<typeof createAccountRepository>;
  }
}

export function createAccountRepository(fastify: FastifyInstance) {
  const { prisma } = fastify;

  return {
    async createAccount(params: CreateAccount): Promise<Account> {
      const account = await prisma.account.create({
        data: params,
      });

      return account;
    },

    async findByEmail(email: string): Promise<Account | null> {
      const account = await prisma.account.findUnique({
        where: {
          email,
        },
      });

      return account;
    },
  };
}

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    const repository = createAccountRepository(fastify);
    fastify.decorate("accountRepository", repository);
  },
  {
    name: "account-repository",
    dependencies: ["prisma"],
  },
);
