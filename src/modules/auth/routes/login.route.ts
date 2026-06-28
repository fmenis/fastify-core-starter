import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { auth } from "../../../lib/auth.js";
import { buildRouteFullDescription } from "../../../utils/utils.js";
import {
  baAuthResponseSchema,
  BaAuthResponseSchemaType,
  baErrorSchema,
  signInEmailBodySchema,
  SignInEmailBodySchemaType,
} from "../auth.schema.js";
import { BaUrl } from "../auth.enum.js";
import { createFetchRequest, throwException } from "../utils.js";

export default async function login(fastify: FastifyInstance): Promise<void> {
  fastify.route({
    url: "/login",
    method: "POST",
    config: { public: true, disableVersioning: true },
    schema: {
      description: buildRouteFullDescription({
        api: "login",
        description: "Sign in with email and password.",
        errors: [],
      }),
      body: signInEmailBodySchema,
      response: {
        200: baAuthResponseSchema,
        401: baErrorSchema,
      },
    },
    handler: onLogin,
  });

  async function onLogin(
    req: FastifyRequest<{ Body: SignInEmailBodySchemaType }>,
    reply: FastifyReply,
  ): Promise<BaAuthResponseSchemaType> {
    const request = createFetchRequest(req, { baPath: BaUrl.SIGN_IN_EMAIL });
    const response = await auth.handler(request);

    if (!response.ok) {
      await throwException(response);
    }

    response.headers.forEach((v, k) => reply.header(k, v));
    reply.status(response.status);

    return (await response.json()) as BaAuthResponseSchemaType;
  }
}
