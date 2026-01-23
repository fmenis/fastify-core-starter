import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { Kysely } from "kysely";

import type { DB } from "../generated/kysely/types.js";
import kysely from "../lib/kysely.js";

declare module "fastify" {
  interface FastifyInstance {
    kysely: Kysely<DB>;
  }
}

async function kyselyPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.decorate("kysely", kysely);

  fastify.addHook("onClose", async server => {
    await server.kysely.destroy();
    server.log.debug("Postgres connection pool closed");
  });
}

export default fp(kyselyPlugin, { name: "kysely" });
