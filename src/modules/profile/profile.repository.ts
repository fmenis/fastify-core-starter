import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { CreateProfile } from "./profile.interface.js";
import { Selectable } from "kysely";
import { Profile } from "../../generated/kysely/types.js";

declare module "fastify" {
  interface FastifyInstance {
    profileRepository: ReturnType<typeof createProfileRepository>;
  }
}

/**
 * ##TODO
 * read carefully this https://kysely.dev/docs/getting-started#types
 * and understand if the custom interfaces ("./profile.interface.js") are needed
 * of the db ones are enough.
 */

export function createProfileRepository(fastify: FastifyInstance) {
  const { kysely } = fastify;

  return {
    async createProfile(params: CreateProfile): Promise<Selectable<Profile>> {
      const profile = await kysely
        .insertInto("profile")
        .values(params)
        .returningAll()
        .executeTakeFirstOrThrow();

      return profile;
    },

    async findByEmail(email: string): Promise<Selectable<Profile> | null> {
      const profile = await kysely
        .selectFrom("profile")
        .selectAll()
        .where("email", "=", email)
        .where("deletedAt", "is", null)
        .executeTakeFirst();

      return profile ?? null;
    },

    async findById(id: string): Promise<Selectable<Profile> | null> {
      const profile = await kysely
        .selectFrom("profile")
        .selectAll()
        .where("id", "=", id)
        .where("deletedAt", "is", null)
        .executeTakeFirst();

      return profile ?? null;
    },
  };
}

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    const repository = createProfileRepository(fastify);
    fastify.decorate("profileRepository", repository);
  },
  {
    name: "profile-repository",
    dependencies: ["kysely"],
  },
);
