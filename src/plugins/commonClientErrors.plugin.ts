import { HttpError } from "@fastify/sensible";
import { FastifyInstance } from "fastify";
import Fp from "fastify-plugin";
import { DocumentationError } from "../common/interface.js";

declare module "fastify" {
  interface FastifyInstance {
    commonClientErrors: {
      throwNotFoundError(data: { name: string; id: string }): void;
      documentationErrors: DocumentationError[];
    };
  }
}

async function commonClientErrorsPlugin(fastify: FastifyInstance) {
  const { createError } = fastify.httpErrors;

  function throwNotFoundError(data: { name: string; id: string }): HttpError {
    const { name, id } = data;
    const message = `Entity '${name}' with '${id}' not found.`;

    throw createError(404, message, {
      internalCode: "NOT_FOUND",
      details: { entityId: id, entityName: name },
    });
  }

  fastify.decorate("commonClientErrors", {
    throwNotFoundError,
    documentationErrors: [
      {
        code: "*NOT_FOUND*",
        description: "occurs when the target entity is not present.",
        apis: ["read", "list"],
        statusCode: 404,
      },
    ],
  });
}

export default Fp(commonClientErrorsPlugin);
