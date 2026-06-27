import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../../lib/auth.js";

export default fp(async function betterAuthPlugin(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.all(
    "/auth/*",
    { config: { public: true, disableVersioning: true } },
    async (request, reply) => {
      const url = new URL(request.url, process.env.BETTER_AUTH_URL!);
      const req = new Request(url, {
        method: request.method,
        headers: fromNodeHeaders(request.headers),
        body: ["GET", "HEAD"].includes(request.method)
          ? undefined
          : JSON.stringify(request.body),
      });
      const response = await auth.handler(req);
      reply.status(response.status);
      response.headers.forEach((v, k) => reply.header(k, v));
      return reply.send(await response.text());
    },
  );
});

/**
 * I formati di risposta delle API BA non possono essere customizzati
 */
