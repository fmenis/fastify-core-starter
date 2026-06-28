import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { auth } from "../../../lib/auth.js";
import { buildRouteFullDescription } from "../../../utils/utils.js";
import { baErrorSchema, baSignOutResponseSchema } from "../auth.schema.js";
import { BaUrl } from "../auth.enum.js";
import { createFetchRequest, throwException } from "../utils.js";

export default async function logout(fastify: FastifyInstance): Promise<void> {
  const version = "1.0.0";

  //##TODO rimappare errori BA e documentarli

  fastify.route({
    url: "/logout",
    method: "POST",
    config: { public: true },
    constraints: { version },
    schema: {
      description: buildRouteFullDescription({
        api: "logout",
        description:
          "Invalidate the current session and clear session cookies.",
        errors: [],
      }),
      response: {
        200: baSignOutResponseSchema,
        401: baErrorSchema,
      },
    },
    handler: onLogout,
  });

  async function onLogout(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<{ success: boolean }> {
    const request = createFetchRequest(req, { baPath: BaUrl.SIGN_OUT });
    const response = await auth.handler(request);

    if (!response.ok) {
      await throwException(response);
    }

    // Forward Set-Cookie headers so the browser clears the session cookies
    response.headers.forEach((v, k) => reply.header(k, v));
    reply.status(response.status);

    return (await response.json()) as { success: boolean };
  }
}
