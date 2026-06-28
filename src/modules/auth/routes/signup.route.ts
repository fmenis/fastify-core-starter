import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { buildRouteFullDescription } from "../../../utils/utils.js";
import {
  baErrorSchema,
  baSignUpResponseSchema,
  signUpEmailBodySchema,
  SignUpEmailBodySchemaType,
} from "../auth.schema.js";
import { BaUrl } from "../auth.enum.js";
import { auth } from "../../../lib/auth.js";
import { createFetchRequest, throwException } from "../utils.js";

export default async function signUp(fastify: FastifyInstance): Promise<void> {
  fastify.route({
    url: "/register",
    method: "POST",
    config: { public: true, disableVersioning: true },
    schema: {
      description: buildRouteFullDescription({
        api: "register",
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
}
