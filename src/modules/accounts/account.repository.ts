import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Account, CreateAccount } from "./account.interface.js";

declare module "fastify" {
  interface FastifyInstance {
    accountRepository: ReturnType<typeof createAccountRepository>;
  }
}

/**
 * TODO
 * read carefully this https://kysely.dev/docs/getting-started#types
 * and understand if the custom interfaces ("./account.interface.js") are needed
 * of the db ones are enough
 */

export function createAccountRepository(fastify: FastifyInstance) {
  const { kysely } = fastify;

  return {
    async createAccount(params: CreateAccount): Promise<Account> {
      const account: Account = await kysely
        .insertInto("account")
        .values(params)
        .returningAll()
        .executeTakeFirstOrThrow();

      return account;
    },

    async findByEmail(email: string): Promise<Account | null> {
      const account = await kysely
        .selectFrom("account")
        .selectAll()
        .where("email", "=", email)
        .where("deletedAt", "<>", null)
        .executeTakeFirst();

      return account ?? null;
    },

    async findById(id: string): Promise<Account | null> {
      const account = await kysely
        .selectFrom("account")
        .selectAll()
        .where("id", "=", id)
        .where("deletedAt", "<>", null)
        .executeTakeFirst();

      return account ?? null;
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
    dependencies: ["kysely"],
  },
);
