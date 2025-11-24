import { FastifyInstance } from "fastify";
import Fp from "fastify-plugin";
import { Queue, QueueOptions } from "bullmq";
import { redisProducerClient, redisWorkerClient } from "../lib/redis.js";

declare module "fastify" {
  export interface FastifyInstance {
    bullmq: {
      queue: Queue;
    };
  }
}

function bullmqPlugin(fastify: FastifyInstance): void {
  const queueName = "my-queue";

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

  const myQueue = new Queue(queueName, options);

  //##TODO queueEvents

  fastify.addHook("onClose", async () => {
    await redisProducerClient.quit();
    await redisWorkerClient.quit();
    fastify.log.debug("Redis connections closed");
  });

  fastify.decorate("bullmq", {
    queue: myQueue,
  });
}

export default Fp(bullmqPlugin);
