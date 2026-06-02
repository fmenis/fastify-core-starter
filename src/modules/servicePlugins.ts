import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import activityLogService from "./activityLog/activityLog.service.js";
import profileRepository from "./profile/profile.repository.js";
import profileService from "./profile/profile.service.js";

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    await fastify.register(profileRepository);

    await fastify.register(activityLogService);
    await fastify.register(profileService);
  },
  {
    name: "service-plugins",
    dependencies: ["kysely"],
  },
);
