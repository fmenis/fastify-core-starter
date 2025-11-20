import { FastifyInstance, FastifyRequest /*, RegisterOptions*/ } from "fastify";

import { buildRouteFullDescription } from "../../../utils/main.js";
import {
  loginBodySchema,
  loginBodySchemaType,
  loginResponseSchema,
  loginResponseSchemaType,
} from "../auth.schema.js";

export default async function login(
  fastify: FastifyInstance,
  // opts: RegisterOptions,
): Promise<void> {
  const { accountRepository, commonClientErrors } = fastify;
  const { throwNotFoundError, errors } = commonClientErrors;

  fastify.route({
    url: "/login",
    method: "POST",
    schema: {
      description: buildRouteFullDescription({
        api: "login",
        description: "Authenticate user.",
        errors,
      }),
      body: loginBodySchema,
      response: {
        200: loginResponseSchema,
        400: fastify.getSchema("sBadRequest"),
        404: fastify.getSchema("sNotFound"),
      },
    },
    handler: onLogin,
  });

  async function onLogin(
    req: FastifyRequest<{ Body: loginBodySchemaType }>,
    // reply: FastifyReply,
  ): Promise<loginResponseSchemaType | undefined> {
    const { email } = req.body;

    const account = await accountRepository.findByEmail(email);

    if (!account) {
      throwNotFoundError({ id: "fgfdsgsfg", name: "user" });
    }

    return { jwt: "jwt" };
  }
}
