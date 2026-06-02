import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Worker } from "bullmq";

import { redisWorkerClient } from "../../lib/redis.js";
import {
  SCHEDULED_QUEUE_NAME,
  SCHEDULER_ID,
  SCHEDULED_JOB_NAME,
} from "../../common/constants.js";
import { handleDeleteInactiveProfiles } from "./jobs/deleteInactiveProfiles.job.js";

/**
 * Worker for cron jobs
 */
async function schedulerPlugin(fastify: FastifyInstance): Promise<void> {
  const worker = new Worker(
    SCHEDULED_QUEUE_NAME,
    async job => {
      switch (job.name) {
        case SCHEDULED_JOB_NAME.DELETE_INACTIVE_PROFILES:
          await handleDeleteInactiveProfiles(job.id!);
          break;
        default:
          fastify.log.error({ jobName: job.name }, "unknown scheduled job");
      }
    },
    { connection: redisWorkerClient },
  );

  worker.on("error", err => fastify.log.error(err));
  fastify.addHook("onClose", async () => worker.close());

  fastify.addHook("onReady", async () => {
    await fastify.bullmq.scheduledQueue.upsertJobScheduler(
      SCHEDULER_ID.DELETE_INACTIVE_PROFILES,
      { every: 5000 },
      { name: SCHEDULED_JOB_NAME.DELETE_INACTIVE_PROFILES, data: {} },
    );
    fastify.log.debug("scheduled jobs registered");
  });
}

export default fp(schedulerPlugin, {
  name: "scheduler",
  dependencies: ["bullmq"],
});
