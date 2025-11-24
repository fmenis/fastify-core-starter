import knex, { Knex } from "knex";
import { APP_ENV } from "../common/enum.js";

const options = {
  client: "pg",
  connection: {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    user: process.env.PG_USER,
    database: process.env.PG_DB,
    password: process.env.PG_PW,
  },
  debug:
    process.env.APP_ENV === APP_ENV.LOCAL ||
    process.env.APP_ENV === APP_ENV.DEVELOPMENT,
};

export const knexInstance: Knex = knex(options);
