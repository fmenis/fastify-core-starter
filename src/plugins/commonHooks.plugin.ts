/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";

import { trimObjectFields } from "../utils/main.js";

declare module "fastify" {
  interface FastifyRequest {
    resource: any;
  }

  interface FastifyContextConfig {
    trimBodyFields?: string[] | undefined;
    public?: boolean;
  }
}

async function commonHooksPlugin(fastify: FastifyInstance): Promise<void> {
  /**
   * Empty object that can be utilized to pass data between hooks
   */
  fastify.addHook("onRequest", async req => {
    req.resource = {};
  });

  /**
   * Additional request logs and trim target body fields
   */
  fastify.addHook("preValidation", async (req: FastifyRequest) => {
    //##TODO
    // const { body, log, user } = req

    // if (user) {
    //   log.debug(
    //     {
    //       id: user.id,
    //       email: user.email,
    //     },
    //     'user'
    //   )
    // }

    // if (fastify.config.ENABLE_BODY_LOG && body) {
    //   log.debug(body, 'parsed body')
    // }

    if (req.routeOptions.config.trimBodyFields && req.body) {
      req.body = trimObjectFields(
        req.routeOptions.config.trimBodyFields,
        req.body,
      );
    }
  });

  /**
   * Set common routes stuff
   */
  fastify.addHook("onRoute", options => {
    options.schema = {
      ...options.schema,
      response: {
        ...options.schema!.response!,
        500: fastify.getSchema("sInternalServerError"),
      },
    };
  });

  //##TODO validate with all errors
  fastify.setErrorHandler(
    (error: FastifyError, _req: FastifyRequest, reply: FastifyReply) => {
      let statusCode = error.statusCode ?? 500;

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
