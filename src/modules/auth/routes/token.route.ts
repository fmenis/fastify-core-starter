import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { auth } from "../../../lib/auth.js";
import { buildRouteFullDescription } from "../../../utils/utils.js";
import {
  baErrorSchema,
  baTokenResponseSchema,
  BaTokenResponseSchemaType,
} from "../auth.schema.js";
import { BaUrl } from "../auth.enum.js";
import { createFetchRequest, throwException } from "../utils.js";

export default async function token(fastify: FastifyInstance): Promise<void> {
  const version = "1.0.0";

  //##TODO rimappare errori BA e documentarli

  fastify.route({
    url: "/token",
    method: "GET",
    config: { public: true },
    constraints: { version },
    schema: {
      description: buildRouteFullDescription({
        api: "get token",
        description:
          "Exchange the session cookie for a short-lived JWT access token (15 min, EdDSA).",
        errors: [],
      }),
      response: {
        200: baTokenResponseSchema,
        401: baErrorSchema,
      },
    },
    handler: onGetToken,
  });

  async function onGetToken(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<BaTokenResponseSchemaType> {
    const request = createFetchRequest(req, { baPath: BaUrl.TOKEN });
    const response = await auth.handler(request);

    if (!response.ok) {
      await throwException(response);
    }

    response.headers.forEach((v, k) => reply.header(k, v));
    reply.status(response.status);

    return (await response.json()) as BaTokenResponseSchemaType;
  }
}
