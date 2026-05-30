/**
 * Single Kysely instance added into the fastify instance and used inside queue workers
 */

import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { DB } from "../generated/kysely/types.js";
import { loggerInstance } from "./logger.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

pool.on("error", err => {
  loggerInstance.error({ err }, "Unexpected PostgreSQL client error");
});

export const kysely = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
  log(event) {
    if (event.level === "query") {
      loggerInstance.debug({
        sql: event.query.sql,
        parameters: event.query.parameters,
      });
    }
    if (event.level === "error") {
      loggerInstance.error(
        { err: event.error, sql: event.query.sql },
        "Query failed",
      );
    }
  },
});

try {
  const client = await pool.connect();
  client.release();
  loggerInstance.debug("PostgreSQL connection verified");
} catch (err) {
  loggerInstance.fatal({ err }, "Failed to connect to PostgreSQL — aborting");
  process.exit(1);
}

export default kysely;
