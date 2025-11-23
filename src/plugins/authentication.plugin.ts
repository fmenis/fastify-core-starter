import { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { AuthenticatedUser } from "../common/interface.js";

declare module "fastify" {
  interface FastifyRequest {
    user: AuthenticatedUser | null;
  }
}

async function authenticationPlugin(fastify: FastifyInstance): Promise<void> {
  async function authenticate(request: FastifyRequest) {
    if (request.routeOptions.config.public) {
      return;
    }

    const user: AuthenticatedUser = {
      id: "unique-id",
      email: "foo@bar.com",
    };

    request.user = user;
  }

  fastify.decorateRequest("user", null);
  fastify.addHook("onRequest", authenticate);
}

export default fp(authenticationPlugin);
