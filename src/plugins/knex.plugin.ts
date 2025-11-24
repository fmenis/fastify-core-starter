import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { Knex } from "knex";

import { knexInstance } from "../lib/knex.js";

declare module "fastify" {
  export interface FastifyInstance {
    knex: Knex;
  }
}

async function knexPlugin(fastify: FastifyInstance): Promise<void> {
  const client = knexInstance;

  fastify.addHook("onClose", async instance => {
    await instance.knex.destroy();
    instance.log.debug("Postgres connection pool closed");
  });

  fastify.decorate("knex", client);
}

export default fp(knexPlugin, { name: "knex" });
