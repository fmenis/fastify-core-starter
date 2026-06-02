import { bootstrapHttpApp } from "../bootstrap.js";
import { validateOpenApi } from "../utils/utils.js";

const fastify = await bootstrapHttpApp();

try {
  await validateOpenApi(fastify);
  await fastify.close();
  process.exit(0);
} catch (err) {
  fastify.log.error(err);
  await fastify.close().catch(() => {});
  process.exit(1);
}
