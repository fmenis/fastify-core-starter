import "../../src/lib/instrument.js";

import Fastify, { FastifyInstance } from "fastify";
import env from "@fastify/env";

import { configSchema } from "../../src/utils/env.schema.js";
import {
  buildServerOptions,
  addFormats,
} from "../../src/utils/server.options.js";
import kyselyPlugin from "../../src/plugins/kysely.plugin.js";
import bullmqPlugin from "../../src/plugins/bullmq.plugin.js";
import servicePlugins from "../../src/modules/servicePlugins.js";
import appPlugin from "../../src/app.js";

let app: FastifyInstance | undefined;

// Returns the same Fastify instance for all test files.
// With singleFork: true the module cache is shared, so this factory is called
// only once per test run regardless of how many test files import it.
export async function getTestApp(): Promise<FastifyInstance> {
  if (app) {
    return app;
  }

  const fastify = Fastify(buildServerOptions());

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
  await fastify.register(appPlugin);

  await fastify.ready();

  app = fastify;
  return app;
}
