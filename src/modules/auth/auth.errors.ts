import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { DocumentationError } from "../../common/interface.js";

declare module "fastify" {
  interface FastifyInstance {
    authClientErrors: {
      throwUserAlreadyRegisteredError(): never;
      errors: DocumentationError[];
    };
  }
}

async function authClientErrorsPlugin(fastify: FastifyInstance) {
  const { createError } = fastify.httpErrors;

  function throwUserAlreadyRegisteredError(): never {
    const message = `User already registered.`;

    throw createError(422, message, {
      internalCode: "USER_ALREADY_EXISTS",
    });
  }

  fastify.decorate("authClientErrors", {
    throwUserAlreadyRegisteredError,
    errors: [
      {
        code: "*USER_ALREADY_REGISTERED*",
        description: "occurs when the user is already registered.",
        apis: ["register"],
        statusCode: 422,
      },
    ],
  });
}

export default fp(authClientErrorsPlugin);
