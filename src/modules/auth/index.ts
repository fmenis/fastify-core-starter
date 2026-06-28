import { FastifyInstance } from "fastify";

import register from "./routes/register.route.js";
import login from "./routes/login.route.js";
// import betterAuthPlugin from "./betterAuth.plugin.js";
// import betterAuthApis from "./routes/betterAuth.apis.js";

export default async function index(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("onRoute", options => {
    options.schema = {
      ...options.schema,
      tags: ["auth"],
    };
  });

  const prefix = "/auth";

  fastify.register(register, { prefix });
  fastify.register(login, { prefix });
  // fastify.register(betterAuthApis);
  // fastify.register(betterAuthPlugin);
}
