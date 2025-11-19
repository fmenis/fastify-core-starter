import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyRequest {
    resource: any;
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
}

export default fp(commonHooksPlugin);
