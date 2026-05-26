import "./lib/instrument.js";

import Fastify, { FastifyInstance } from "fastify";
import env from "@fastify/env";

import { ConfigSchemaType, configSchema } from "./utils/env.schema.js";
import { buildServerOptions, addFormats } from "./utils/server.options.js";
import kyselyPlugin from "./plugins/kysely.plugin.js";
import servicePlugins from "./modules/servicePlugins.js";

declare module "fastify" {
  interface FastifyInstance {
    config: ConfigSchemaType;
  }
}

export async function bootstrapApp(): Promise<FastifyInstance> {
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
  await fastify.register(servicePlugins);

  await fastify.ready();

  return fastify;
}
