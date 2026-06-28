import { FastifyInstance } from "fastify";

import authClientErrorsPlugin from "./auth.errors.js";
import register from "./routes/register.route.js";
import login from "./routes/login.route.js";
import token from "./routes/token.route.js";
import logout from "./routes/logout.route.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("onRoute", options => {
    options.schema = {
      ...options.schema,
      tags: ["auth"],
    };
  });

  fastify.register(authClientErrorsPlugin);

  const prefix = "/auth";
  fastify.register(register, { prefix });
  fastify.register(login, { prefix });
  fastify.register(token, { prefix });
  fastify.register(logout, { prefix });
}
