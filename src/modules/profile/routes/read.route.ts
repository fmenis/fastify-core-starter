import { FastifyInstance, FastifyRequest } from "fastify";

import { EntityNotFoundError } from "../../../common/errors.js";
import { buildRouteFullDescription } from "../../../utils/utils.js";
import {
  readProfileParamsSchema,
  ReadProfileParamsSchemaType,
  readProfileResponseSchema,
  ReadProfileResponseSchemaType,
} from "../profile.schema.js";

export default async function read(fastify: FastifyInstance): Promise<void> {
  const { profileService, commonClientErrors } = fastify;
  const { throwNotFoundError, errors } = commonClientErrors;

  const version = "1.0.0";

  fastify.route({
    url: "/:id",
    method: "GET",
    config: {
      public: false,
    },
    constraints: {
      version,
    },
    schema: {
      description: buildRouteFullDescription({
        api: "read profile",
        description: "Get profile by ID.",
        version,
        errors,
      }),
      params: readProfileParamsSchema,
      response: {
        200: readProfileResponseSchema,
        400: fastify.getSchema("sBadRequest"),
        404: fastify.getSchema("sNotFound"),
      },
    },
    handler: onRead,
  });

  async function onRead(
    req: FastifyRequest<{ Params: ReadProfileParamsSchemaType }>,
  ): Promise<ReadProfileResponseSchemaType> {
    const { id } = req.params;

    try {
      const profile = await profileService.findById(id);

      return {
        id: profile.id,
        userId: profile.userId ?? null,
        firstName: profile.firstName ?? null,
        lastName: profile.lastName ?? null,
        userName: profile.userName ?? null,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt?.toISOString() ?? null,
        deletedAt: profile.deletedAt?.toISOString() ?? null,
      };
    } catch (error) {
      //##TODO togliere questa logica, mettere gli errori http nel service (per il momento)
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
