import { FastifyInstance } from "fastify";
import Fp from "fastify-plugin";
import { Queue, QueueOptions, ConnectionOptions } from "bullmq";

declare module "fastify" {
  export interface FastifyInstance {
    bullmq: {
      queue: Queue;
      connection: ConnectionOptions;
    };
  }
}

function bullmqPlugin(fastify: FastifyInstance): void {
  const queueName = "my-queue";

  const connection: ConnectionOptions = {
    host: fastify.config.REDIS_HOST,
    port: fastify.config.REDIS_PORT,
  };

  const options: QueueOptions = {
    connection,
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

  fastify.decorate("bullmq", {
    queue: myQueue,
    connection,
  });
}

export default Fp(bullmqPlugin);
