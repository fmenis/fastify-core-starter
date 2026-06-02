import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { Profile } from "../../generated/kysely/types.js";
import { EntityNotFoundError } from "../../common/errors.js";
import { Selectable } from "kysely";

declare module "fastify" {
  interface FastifyInstance {
    profileService: ReturnType<typeof profileService>;
  }
}

export function profileService(fastify: FastifyInstance) {
  const { profileRepository } = fastify;

  return {
    async findById(profileId: string): Promise<Selectable<Profile>> {
      const profile = await profileRepository.findById(profileId);

      if (!profile) {
        throw new EntityNotFoundError("profile", profileId);
      }

      return profile;
    },
  };
}

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    const service = profileService(fastify);
    fastify.decorate("profileService", service);
  },
  {
    name: "profile-service",
    dependencies: ["profile-repository"],
  },
);
