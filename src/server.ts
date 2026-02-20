import "./lib/instrument.js";

import Fastify from "fastify";
import env from "@fastify/env";
import closeWithGrace from "close-with-grace";

import { ConfigSchemaType, configSchema } from "./utils/env.schema.js";
import { validateOpenApi } from "./utils/main.js";
import swaggerPlugin from "./plugins/swagger.plugin.js";

import app from "./app.js";
import { buildServerOptions, addFormats } from "./utils/server.options.js";

declare module "fastify" {
  interface FastifyInstance {
    config: ConfigSchemaType;
  }
}

const fastify = Fastify(buildServerOptions());

async function init() {
  try {
    await fastify.register(env, {
      confKey: "config",
      schema: configSchema,
      ajv: {
        customOptions(ajvInstance) {
          addFormats(ajvInstance);
          return ajvInstance;
        },
      },
    });

    await fastify.register(swaggerPlugin);

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
      port: fastify.config.SERVER_PORT,
      host: fastify.config.SERVER_ADDRESS,
    });

    fastify.log.debug(
      `Service '${fastify.config.APP_NAME}' launched in '${fastify.config.APP_ENV}' environment`,
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

init();
