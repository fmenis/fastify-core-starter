import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";

import { PrismaClient } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

async function prismaPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async server => {
    await server.prisma.$disconnect();
    server.log.debug("Postgres connection pool closed");
  });
}

export default fp(prismaPlugin, { name: "prisma" });
