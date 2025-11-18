import Fastify from "fastify";
import env from "@fastify/env";
import closeWithGrace from "close-with-grace";

import { ConfigSchemaType, configSchema } from "./utils/env.schema.js";
import { validateOpenApi } from "./utils/main.js";
import openApiPlugin from "./plugins/openApi.plugin.js";

import app from "./app.js";
import { buildServerOptions } from "./utils/server.options.js";

declare module "fastify" {
  interface FastifyInstance {
    env: ConfigSchemaType;
  }
}

const fastify = Fastify(buildServerOptions());

async function init() {
  try {
    await fastify.register(env, {
      confKey: "env",
      schema: configSchema,
    });

    await fastify.register(openApiPlugin);

    await fastify.register(app);

    closeWithGrace({ delay: 2000 }, async ({ signal, err }) => {
      const { log } = fastify;
      if (err) {
        log.error(err);
      }
      log.debug(
        `'${signal}' signal received. Gracefully closing fastify server`,
      );
      await fastify.close();
    });

    await fastify.ready();

    await validateOpenApi(fastify);

    await fastify.listen({
      port: fastify.env.SERVER_PORT,
      host: fastify.env.SERVER_ADDRESS,
    });

    fastify.log.debug(
      `Service '${fastify.env.APP_NAME}' launched in '${fastify.env.APP_ENV}' environment`,
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

init();
