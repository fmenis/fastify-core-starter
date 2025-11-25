import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

await prisma.$connect();

//TODO verify connection

export default prisma;
