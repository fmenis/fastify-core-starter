import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../../../lib/auth.js";
import { buildRouteFullDescription } from "../../../utils/utils.js";
import {
  // baAuthResponseSchema,
  baErrorSchema,
  // baGetSessionResponseSchema,
  // baJwksResponseSchema,
  // baSignOutResponseSchema,
  baSignUpResponseSchema,
  // baTokenResponseSchema,
  // signInEmailBodySchema,
  signUpEmailBodySchema,
  SignUpEmailBodySchemaType,
} from "../auth.schema.js";
import { BaRequestOpt } from "../auth.interface.js";
import { BaUrl } from "../auth.enum.js";

/**
 * Better auth routes are registered by a single catch-all handler (betterAuthPlugin: fastify.all)
 * and are invisible to Swagger. In order to document them, this file explicit registers
 * individual Fastify routes.
 * Every request is then proxied directly to BA.
 */
export default fp(async function betterAuthApi(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.route({
    url: "/auth/sign-up/email",
    method: "POST",
    config: { public: true, disableVersioning: true },
    schema: {
      description: buildRouteFullDescription({
        api: "sign-up",
        description: "Register a new user with email and password.",
        errors: [],
      }),
      body: signUpEmailBodySchema,
      response: {
        200: baSignUpResponseSchema,
        422: baErrorSchema,
      },
    },
    handler: async (
      req: FastifyRequest<{ Body: SignUpEmailBodySchemaType }>,
      reply: FastifyReply,
    ) => {
      /**
       * ##TODO
       * normalmente BA crea già una sessione durante il signup,
       * ritornando sia il token che il cookie. Qui invece torniamo
       * solo lo user che è stato creato, ma lato BA (db) l'utente è
       * comunque autenticato. Capire se voglio direttamente l'utente autenticato
       * all signup oppure no.
       */
      const request = createFetchRequest(req, {
        baPath: BaUrl.SIGN_UP_EMAIL,
      });
      const response = await auth.handler(request);

      if (!response.ok) {
        await throwException(response);
      }

      reply.status(response.status);

      // setta i cookie della risposta BA alla risposta fastify (col cookie di auth)
      // response.headers.forEach((v, k) => reply.header(k, v));

      const body = (await response.json()) as { user: unknown };
      return { user: body.user };
    },
  });

  // fastify.route({
  //   url: "/auth/sign-in/email",
  //   method: "POST",
  //   config: { public: true, disableVersioning: true },
  //   schema: {
  //     description: buildRouteFullDescription({
  //       api: "sign-in",
  //       description:
  //         "Sign in with email and password. Sets a session cookie (30 days).",
  //       errors: [],
  //     }),
  //     body: signInEmailBodySchema,
  //     response: {
  //       200: baAuthResponseSchema,
  //       401: baErrorSchema,
  //     },
  //   },
  //   handler: proxyToBA,
  // });

  // fastify.route({
  //   url: "/auth/sign-out",
  //   method: "POST",
  //   config: { public: true, disableVersioning: true },
  //   schema: {
  //     description: buildRouteFullDescription({
  //       api: "sign-out",
  //       description:
  //         "Invalidate the current session. Requires the session cookie.",
  //       errors: [],
  //     }),
  //     response: {
  //       200: baSignOutResponseSchema,
  //     },
  //   },
  //   handler: proxyToBA,
  // });

  // fastify.route({
  //   url: "/auth/token",
  //   method: "GET",
  //   config: { public: true, disableVersioning: true },
  //   schema: {
  //     description: buildRouteFullDescription({
  //       api: "get token",
  //       description:
  //         "Exchange a valid session cookie for a short-lived JWT access token (15 min, EdDSA).",
  //       errors: [],
  //     }),
  //     response: {
  //       200: baTokenResponseSchema,
  //       401: baErrorSchema,
  //     },
  //   },
  //   handler: proxyToBA,
  // });

  // fastify.route({
  //   url: "/auth/jwks",
  //   method: "GET",
  //   config: { public: true, disableVersioning: true },
  //   schema: {
  //     description: buildRouteFullDescription({
  //       api: "jwks",
  //       description:
  //         "Return the JSON Web Key Set (EdDSA/Ed25519 public keys) used to verify JWT tokens.",
  //       errors: [],
  //     }),
  //     response: {
  //       200: baJwksResponseSchema,
  //     },
  //   },
  //   handler: proxyToBA,
  // });

  // fastify.route({
  //   url: "/auth/get-session",
  //   method: "GET",
  //   config: { public: true, disableVersioning: true },
  //   schema: {
  //     description: buildRouteFullDescription({
  //       api: "get session",
  //       description:
  //         "Return the active session and user for the current session cookie.",
  //       errors: [],
  //     }),
  //     response: {
  //       200: baGetSessionResponseSchema,
  //     },
  //   },
  //   handler: proxyToBA,
  // });
});

// translate fastify request in standard Fetch request for BA
function createFetchRequest(
  request: FastifyRequest,
  opts: BaRequestOpt = {},
): Request {
  const url = new URL(opts.baPath ?? request.url, process.env.BETTER_AUTH_URL!);
  const req = new Request(url, {
    method: request.method,
    headers: fromNodeHeaders(request.headers),
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : JSON.stringify(request.body),
  });

  return req;
}

async function throwException(response: Response): Promise<void> {
  const text = await response.text();

  if (response.status >= 400) {
    let parsed: { message?: string; code?: string } | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // non-JSON body — fall through to a generic 500
    }

    throw Object.assign(new Error(parsed?.message ?? "An error occurred."), {
      statusCode: response.status,
      internalCode: parsed?.code ?? "UNKNOWN",
      details: {},
    });
  }
}

// async function proxyToBA(
//   request: FastifyRequest,
//   reply: FastifyReply,
// ): Promise<void> {
//   const url = new URL(request.url, process.env.BETTER_AUTH_URL!);
//   const req = new Request(url, {
//     method: request.method,
//     headers: fromNodeHeaders(request.headers),
//     body: ["GET", "HEAD"].includes(request.method)
//       ? undefined
//       : JSON.stringify(request.body),
//   });

//   // internal BA router
//   const response = await auth.handler(req);
//   const text = await response.text();

//   if (response.status >= 400) {
//     let parsed: { message?: string; code?: string } | null = null;
//     try {
//       parsed = JSON.parse(text);
//     } catch {
//       // non-JSON body — fall through to a generic 500
//     }

//     throw Object.assign(new Error(parsed?.message ?? "An error occurred."), {
//       statusCode: response.status,
//       internalCode: parsed?.code ?? "UNKNOWN",
//       details: {},
//     });
//   }

//   reply.status(response.status);
//   response.headers.forEach((v, k) => reply.header(k, v));
//   return reply.send(text);
// }
