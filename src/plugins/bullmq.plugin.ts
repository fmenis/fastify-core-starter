import { FastifyInstance } from "fastify";
import Fp from "fastify-plugin";
import { Queue, QueueOptions } from "bullmq";
import { redisProducerClient, redisWorkerClient } from "../lib/redis.js";
import { QUEUE_NAME, SCHEDULED_QUEUE_NAME } from "../common/constants.js";

declare module "fastify" {
  export interface FastifyInstance {
    bullmq: {
      queue: Queue;
      scheduledQueue: Queue;
    };
  }
}

function bullmqPlugin(fastify: FastifyInstance): void {
  const options: QueueOptions = {
    connection: redisProducerClient,
    defaultJobOptions: {
      removeOnComplete: 1000,
      removeOnFail: 1000,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    },
  };

  const queue = new Queue(QUEUE_NAME, options);
  const scheduledQueue = new Queue(SCHEDULED_QUEUE_NAME, options);

  fastify.addHook("onClose", async () => {
    await redisProducerClient.quit();
    await redisWorkerClient.quit();
    fastify.log.debug("Redis connections closed");
  });

  fastify.decorate("bullmq", { queue, scheduledQueue });
}

export default Fp(bullmqPlugin, { name: "bullmq" });
