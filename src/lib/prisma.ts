/**
 * Single Prisma client added into the fastify instance and used inside queue workers
 */

import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

await prisma.$connect();

export default prisma;
