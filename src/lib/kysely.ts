/**
 * Single Kysely instance added into the fastify instance and used inside queue workers
 */

import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB } from "../generated/kysely/types.js";
import { loggerInstance } from "./logger.js";

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PW,
  max: 10,
});

export const kysely = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
  log(event) {
    if (event.level === "query") {
      loggerInstance.debug({
        sql: event.query.sql,
        parameters: event.query.parameters,
      });
    }
  },
});

export default kysely;
