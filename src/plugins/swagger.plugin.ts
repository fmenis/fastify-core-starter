import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import { getServerVersion } from "../utils/main.js";
import { APP_ENV } from "../common/enum.js";

async function swaggerPlugin(fastify: FastifyInstance): Promise<void> {
  const version = await getServerVersion();

  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Fastify API docs",
        description: "OpenApi v3 documentation",
        version,
        contact: {
          name: "API Support",
          email: "filippomeniswork@gmail.com",
        },
      },
      externalDocs: {
        description: "Find more info here",
        url: "https://github.com/fmenis/fastify-core-starter",
      },
      servers:
        process.env.APP_ENV === APP_ENV.LOCAL
          ? [
              {
                url: `http://${process.env.SERVER_ADDRESS}:${process.env.SERVER_PORT}`,
                description: "Service api",
              },
            ]
          : [
              {
                url: `https://${process.env.API_DOMAIN}`,
                description: "Service api",
              },
            ],
      tags: [
        { name: "auth", description: "Auth related end-points" },
        { name: "misc", description: "Misc related end-points" },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/doc",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });
}

export default fp(swaggerPlugin);
