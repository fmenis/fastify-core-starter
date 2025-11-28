import { FastifyInstance, FastifyRequest } from "fastify";

import { buildRouteFullDescription } from "../../../utils/main.js";
import {
  loginBodySchema,
  loginBodySchemaType,
  loginResponseSchema,
  loginResponseSchemaType,
} from "../auth.schema.js";
import { JOB_NAME } from "../queue/auth.worker.js";

export default async function login(fastify: FastifyInstance): Promise<void> {
  const { accountRepository, commonClientErrors, bullmq } = fastify;
  const { throwNotFoundError, errors } = commonClientErrors;

  fastify.route({
    url: "/login",
    method: "POST",
    config: {
      public: true,
    },
    constraints: {
      version: "1.0.0",
    },
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
  ): Promise<loginResponseSchemaType | undefined> {
    const { email } = req.body;

    const account = await accountRepository.findByEmail(email);

    await bullmq.queue.add(
      JOB_NAME.SEND_RESET_PASSWORD_EMAIL,
      {
        email,
      },
      { delay: 2000 },
    );

    if (!account) {
      throwNotFoundError({ id: "fgfdsgsfg", name: "user" });
    }

    return { jwt: "jwt" };
  }
}
