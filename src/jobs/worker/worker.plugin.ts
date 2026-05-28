import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Worker } from "bullmq";

import { redisWorkerClient } from "../../lib/redis.js";
import { JOB_NAME, QUEUE_NAME } from "../../common/constants.js";
import { sendResetPasswordEmail } from "../../modules/auth/queue/auth.worker.js";

/**
 * Worker for event driven jobs
 */
async function workerPlugin(fastify: FastifyInstance): Promise<void> {
  const worker = new Worker(
    QUEUE_NAME,
    async job => {
      switch (job.name) {
        case JOB_NAME.SEND_RESET_PASSWORD_EMAIL:
          await sendResetPasswordEmail(job.data);
          break;
        default:
          fastify.log.warn({ jobName: job.name }, "unknown job");
      }
    },
    { connection: redisWorkerClient },
  );

  worker.on("error", err => fastify.log.error(err));
  fastify.addHook("onClose", async () => worker.close());
}

export default fp(workerPlugin, {
  name: "jobs-worker",
  dependencies: ["bullmq"],
});
