import Fastify from "fastify";
import env from "@fastify/env";

import { ConfigSchemaType, configSchema } from "./utils/env.schema.js";

declare module "fastify" {
  interface FastifyInstance {
    env: ConfigSchemaType;
  }
}

const fastify = Fastify({
  logger: {
    level: "debug",
  },
});

async function init() {
  try {
    await fastify.register(env, {
      confKey: "env",
      dotenv: true,
      schema: configSchema,
    });

    await fastify.ready();

    await fastify.listen({
      port: fastify.env.SERVER_PORT!,
      host: fastify.env.SERVER_ADDRESS,
    });

    fastify.log.debug(
      `Server launched in '${fastify.env.APP_ENV}' environment`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

init();
