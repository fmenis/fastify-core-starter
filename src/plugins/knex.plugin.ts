import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import knex, { Knex } from "knex";

declare module "fastify" {
  export interface FastifyInstance {
    knex: Knex;
  }
}

async function knexPlugin(fastify: FastifyInstance): Promise<void> {
  const client = knex({
    client: "pg",
    connection: {
      host: fastify.config.PG_HOST,
      port: fastify.config.PG_PORT,
      user: fastify.config.PG_USER,
      database: fastify.config.PG_DB,
      password: fastify.config.PG_PW,
    },
    debug: true,
  });

  fastify.addHook("onClose", async instance => {
    await instance.knex.destroy();
    instance.log.debug("Connection pool closed");
  });

  fastify.decorate("knex", client);
}

export default fp(knexPlugin, { name: "knex" });
