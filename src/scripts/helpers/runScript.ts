import { FastifyInstance } from "fastify";
import { bootstrapApp } from "../../bootstrap.js";

export async function runScript(
  fn: (fastify: FastifyInstance) => Promise<void>,
): Promise<void> {
  const fastify = await bootstrapApp();
  try {
    await fn(fastify);
  } catch (err) {
    fastify.log.error(err);
    process.exitCode = 1;
  } finally {
    await fastify.close();
  }
}
