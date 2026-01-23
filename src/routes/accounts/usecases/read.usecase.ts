import { FastifyInstance, FastifyRequest } from "fastify";

import { buildRouteFullDescription } from "../../../utils/main.js";
import {
  readAccountParamsSchema,
  ReadAccountParamsSchemaType,
  readAccountResponseSchema,
  ReadAccountResponseSchemaType,
} from "../account.schema.js";

export default async function read(fastify: FastifyInstance): Promise<void> {
  const { accountRepository, commonClientErrors } = fastify;
  const { throwNotFoundError, errors } = commonClientErrors;

  const version = "1.0.0";

  fastify.route({
    url: "/:id",
    method: "GET",
    config: {
      public: true,
    },
    constraints: {
      version,
    },
    schema: {
      description: buildRouteFullDescription({
        api: "read account",
        description: "Get account by ID.",
        version,
        errors,
      }),
      params: readAccountParamsSchema,
      response: {
        200: readAccountResponseSchema,
        400: fastify.getSchema("sBadRequest"),
        404: fastify.getSchema("sNotFound"),
      },
    },
    handler: onRead,
  });

  async function onRead(
    req: FastifyRequest<{ Params: ReadAccountParamsSchemaType }>,
  ): Promise<ReadAccountResponseSchemaType | undefined> {
    const { id } = req.params;

    const account = await accountRepository.findById(id);

    if (!account) {
      throwNotFoundError({ id, name: "account" });
      return;
    }

    return {
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      userName: account.userName,
      email: account.email,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }
}
