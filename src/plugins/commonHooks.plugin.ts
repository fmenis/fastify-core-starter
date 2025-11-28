/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";
import { captureException } from "@sentry/node";
import { Type } from "@sinclair/typebox";

import { trimObjectFields } from "../utils/main.js";

declare module "fastify" {
  interface FastifyRequest {
    resource: any;
  }

  interface FastifyContextConfig {
    trimBodyFields?: string[] | undefined;
    public?: boolean;
    disableVersioning?: boolean;
  }
}

async function commonHooksPlugin(fastify: FastifyInstance): Promise<void> {
  // empty object that can be utilized to pass data between hooks
  fastify.addHook("onRequest", async req => {
    req.resource = {};
  });

  fastify.addHook("preValidation", async (req: FastifyRequest) => {
    if (req.routeOptions.config.trimBodyFields && req.body) {
      req.body = trimObjectFields(
        req.routeOptions.config.trimBodyFields,
        req.body,
      );
    }
  });

  fastify.addHook("preHandler", async req => {
    const { body, log, user } = req;

    if (user) {
      log.debug(
        {
          id: user.id,
          email: user.email,
        },
        "user",
      );
    }

    if (body) {
      //TODO add env variable
      req.log.debug({ body: req.body }, "Incoming request body");
    }
  });

  fastify.addHook("onRoute", options => {
    if (!options.config?.disableVersioning) {
      options.schema = {
        ...options.schema,
        headers: Type.Object({
          "accept-version": Type.String({
            description: "Api version header (default: 1.0.0).",
          }),
        }),
      };
    }

    options.schema = {
      ...options.schema,
      response: {
        ...options.schema!.response!,
        500: fastify.getSchema("sInternalServerError"),
      },
    };
  });

  fastify.setErrorHandler(
    (error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
      req.log.error(error);

      let statusCode = error.statusCode ?? 500;

      if (fastify.config.SENTRY_ENABLED && statusCode > 400) {
        captureException(error, {
          user: req.user
            ? { id: req.user.id, email: req.user.email }
            : undefined,
        });
      }

      const clientError: Record<string, any> = {
        statusCode,
        error: (error as any).internalCode || "Internal Server Error",
        message:
          statusCode >= 500
            ? "Something went wrong..."
            : error.message || "Unexpected error.",
        internalCode: (error as any).internalCode || "UNKNOWN",
        details: (error as any).details || {},
      };

      if ((error as any).validation) {
        statusCode = 400;

        clientError.statusCode = 400;
        clientError.error = "Bad Request";
        clientError.internalCode = "BAD_REQUEST";
        clientError.message = `A validation error occurred when validating the ${(error as any).validationContext || "request"}.`;
        clientError.details.validation = (error as any).validation;

        delete (error as any).validation;
        delete (error as any).validationContext;
      }

      delete (clientError as any).code;
      delete (clientError as any).name;

      reply.status(statusCode).send(clientError);
    },
  );

  fastify.setNotFoundHandler(
    {
      preHandler: fastify.rateLimit(),
    },
    function (request: FastifyRequest, reply: FastifyReply) {
      request.log.warn(
        {
          request: {
            method: request.method,
            url: request.url,
            query: request.query,
            params: request.params,
          },
        },
        "Resource not found",
      );

      if (!request.headers["accept-version"]) {
        return {
          message: `Header 'accept-version' not found for Route ${request.method}:${request.originalUrl}`,
          error: "Api versioning header not found",
          statusCode: 404,
          internalCode: "HEADER_NOT_FOUND",
          details: {},
        };
      }

      reply.code(404);

      return {
        message: `Route ${request.method}:${request.originalUrl} not found`,
        error: "Route Not Found",
        statusCode: 404,
        internalCode: "ROUTE_NOT_FOUND",
        details: {},
      };
    },
  );
}

export default fp(commonHooksPlugin);
