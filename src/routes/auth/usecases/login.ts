import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RegisterOptions,
} from "fastify";

import { buildRouteFullDescription } from "../../../utils/main.js";
import {
  loginBodySchema,
  loginBodySchemaType,
  loginResponseSchema,
  loginResponseSchemaType,
} from "../auth.schema.js";
import { Type } from "@sinclair/typebox";

export default async function login(
  fastify: FastifyInstance,
  opts: RegisterOptions,
): Promise<void> {
  const { accountRepository } = fastify;

  fastify.route({
    url: "/login",
    method: "POST",
    schema: {
      description: buildRouteFullDescription({
        api: "login",
        description: "Authenticate user.",
        errors: [], //##TODO,
      }),
      body: loginBodySchema,
      response: {
        200: loginResponseSchema,
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

    // if (!account) {
    //   reply.statusCode = 404;
    //   return;
    // }

    return { jwt: "jwt" };
  }
}
