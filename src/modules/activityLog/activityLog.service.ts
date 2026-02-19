import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { CreateActivityLog } from "./activityLog.interface.js";

declare module "fastify" {
  interface FastifyInstance {
    activityLogService: ReturnType<typeof createActivityLogService>;
  }
}

export function createActivityLogService(fastify: FastifyInstance) {
  const { kysely } = fastify;

  return {
    async createActivityLog(params: CreateActivityLog): Promise<void> {
      await kysely.insertInto("activityLog").values(params).execute();
    },

    async createBulkActivityLogs(params: CreateActivityLog[]): Promise<void> {
      await kysely.insertInto("activityLog").values(params).execute();
    },
  };
}

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    const service = createActivityLogService(fastify);
    fastify.decorate("activityLogService", service);
  },
  {
    name: "activity-log-service",
    dependencies: ["kysely"],
  },
);
