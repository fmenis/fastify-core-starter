import { FastifyInstance, FastifyRequest } from "fastify";

import { EntityNotFoundError } from "../../../common/errors.js";
import { buildRouteFullDescription } from "../../../utils/main.js";
import {
  readAccountParamsSchema,
  ReadAccountParamsSchemaType,
  readAccountResponseSchema,
  ReadAccountResponseSchemaType,
} from "../account.schema.js";

export default async function read(fastify: FastifyInstance): Promise<void> {
  const { accountService, commonClientErrors } = fastify;
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
  ): Promise<ReadAccountResponseSchemaType> {
    const { id } = req.params;

    try {
      const account = await accountService.findAccount(id);

      return {
        id: account.id,
        firstName: account.firstName,
        lastName: account.lastName,
        userName: account.userName,
        email: account.email,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt?.toISOString() ?? null,
        deletedAt: account.deletedAt?.toISOString() ?? null,
      };
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        return throwNotFoundError({
          id: error.entityId,
          name: error.entityName,
        });
      }
      throw error;
    }
  }
}
