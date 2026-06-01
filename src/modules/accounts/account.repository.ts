import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { CreateAccount } from "./account.interface.js";
import { Selectable } from "kysely";
import { Account } from "../../generated/kysely/types.js";

declare module "fastify" {
  interface FastifyInstance {
    accountRepository: ReturnType<typeof createAccountRepository>;
  }
}

/**
 * ##TODO
 * read carefully this https://kysely.dev/docs/getting-started#types
 * and understand if the custom interfaces ("./account.interface.js") are needed
 * of the db ones are enough.
 *
 * ##TODO capire quando lanciare il comando kysely:codegen (anche nelle pipeline)
 */

export function createAccountRepository(fastify: FastifyInstance) {
  const { kysely } = fastify;

  return {
    async createAccount(params: CreateAccount): Promise<Selectable<Account>> {
      const account = await kysely
        .insertInto("account")
        .values(params)
        .returningAll()
        .executeTakeFirstOrThrow();

      return account;
    },

    async findByEmail(email: string): Promise<Selectable<Account> | null> {
      const account = await kysely
        .selectFrom("account")
        .selectAll()
        .where("email", "=", email)
        .where("deletedAt", "is", null)
        .executeTakeFirst();

      return account ?? null;
    },

    async findById(id: string): Promise<Selectable<Account> | null> {
      const account = await kysely
        .selectFrom("account")
        .selectAll()
        .where("id", "=", id)
        .where("deletedAt", "is", null)
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
