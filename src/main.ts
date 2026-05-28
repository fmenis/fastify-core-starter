import "./lib/instrument.js";

import Fastify from "fastify";
import env from "@fastify/env";
import closeWithGrace from "close-with-grace";

import { ConfigSchemaType, configSchema } from "./utils/env.schema.js";
import { validateOpenApi, resolveAppMode } from "./utils/utils.js";
import { AppMode, APP_ENV } from "./common/enum.js";
import { buildServerOptions, addFormats } from "./utils/server.options.js";

import swaggerPlugin from "./plugins/swagger.plugin.js";
import kyselyPlugin from "./plugins/kysely.plugin.js";
import servicePlugins from "./modules/servicePlugins.js";
import bullmqPlugin from "./plugins/bullmq.plugin.js";

import app from "./app.js";
import workerPlugin from "./jobs/worker/worker.plugin.js";
import schedulerPlugin from "./jobs/scheduler/scheduler.plugin.js";

declare module "fastify" {
  interface FastifyInstance {
    config: ConfigSchemaType;
  }
}

const mode = resolveAppMode();
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

    await fastify.register(kyselyPlugin);
    await fastify.register(bullmqPlugin);
    await fastify.register(servicePlugins);

    /**
     * Mode-specific plugins:
     * - in http mode, register routes and related plugins;
     * - in worker mode, register both the jobs worker (event-driven) and the
     * scheduler (cron jobs);
     * - in local http mode, also register the jobs worker so event-driven jobs (e.g. emails)
     *  are processed without a separate process.
     */
    if (mode === AppMode.HTTP) {
      await fastify.register(swaggerPlugin);
      await fastify.register(app);
    }

    if (mode === AppMode.HTTP && fastify.config.APP_ENV === APP_ENV.LOCAL) {
      await fastify.register(workerPlugin);
    }

    if (mode === AppMode.WORKER) {
      await fastify.register(workerPlugin);
      await fastify.register(schedulerPlugin);
    }

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

    if (mode === AppMode.HTTP) {
      await validateOpenApi(fastify);
      await fastify.listen({
        port: fastify.config.SERVER_PORT,
        host: fastify.config.SERVER_ADDRESS,
      });
    }

    fastify.log.debug(
      `Service '${fastify.config.APP_NAME}' launched in '${fastify.config.APP_ENV}' environment (${mode} mode)`,
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

init();
