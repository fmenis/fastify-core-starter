import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    const serverAdapter = new FastifyAdapter();

    createBullBoard({
      queues: [
        new BullMQAdapter(fastify.bullmq.queue),
        new BullMQAdapter(fastify.bullmq.scheduledQueue),
      ],
      serverAdapter,
    });

    serverAdapter.setBasePath("/queues");
    await fastify.register(serverAdapter.registerPlugin(), {
      prefix: "/queues",
    });
  },
  { name: "bull-board", dependencies: ["bullmq"] },
);
