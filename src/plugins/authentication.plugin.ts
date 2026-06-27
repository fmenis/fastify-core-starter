import { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { AuthenticatedUser } from "../common/interface.js";

declare module "fastify" {
  interface FastifyRequest {
    user: AuthenticatedUser | null;
  }
}

const JWKS = createRemoteJWKSet(
  new URL("/api/auth/jwks", process.env.BETTER_AUTH_URL!),
);

async function authenticationPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.decorateRequest("user", null);

  fastify.addHook("onRequest", async (request: FastifyRequest) => {
    if (request.routeOptions.config.public) {
      return;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw fastify.httpErrors.unauthorized("Missing Bearer token");
    }

    const token = authHeader.slice(7);
    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: process.env.BETTER_AUTH_URL,
        audience: process.env.BETTER_AUTH_URL,
      });
      request.user = {
        id: payload["id"] as string,
        email: payload["email"] as string,
      };
    } catch {
      //#TODO migliorare molto l'error handling (differenziare i vari errori)
      throw fastify.httpErrors.unauthorized("Invalid or expired token");
    }
  });
}

export default fp(authenticationPlugin);
