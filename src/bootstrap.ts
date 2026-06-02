import "./lib/instrument.js";

import Fastify, { FastifyInstance } from "fastify";
import env from "@fastify/env";

import { ConfigSchemaType, configSchema } from "./utils/env.schema.js";
import { buildServerOptions, addFormats } from "./utils/server.options.js";
import kyselyPlugin from "./plugins/kysely.plugin.js";
import bullmqPlugin from "./plugins/bullmq.plugin.js";
import servicePlugins from "./modules/servicePlugins.js";
import swaggerPlugin from "./plugins/swagger.plugin.js";
import app from "./app.js";

declare module "fastify" {
  interface FastifyInstance {
    config: ConfigSchemaType;
  }
}

async function createBase(): Promise<FastifyInstance> {
  const fastify = Fastify(buildServerOptions());

  //##TODO unify this code (also present in main.ts)
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
  await fastify.register(servicePlugins);

  return fastify;
}

export async function bootstrapApp(): Promise<FastifyInstance> {
  const fastify = await createBase();
  await fastify.ready();
  return fastify;
}

export async function bootstrapHttpApp(): Promise<FastifyInstance> {
  const fastify = await createBase();

  await fastify.register(bullmqPlugin);
  await fastify.register(swaggerPlugin);
  await fastify.register(app);

  await fastify.ready();
  return fastify;
}
