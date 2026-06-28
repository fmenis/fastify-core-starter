import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { buildRouteFullDescription } from "../../../utils/utils.js";
import {
  baErrorSchema,
  baSignUpResponseSchema,
  BaSignUpResponseSchemaType,
  registerEmailBodySchema,
  RegisterEmailBodySchemaType,
} from "../auth.schema.js";
import { BaError, BaUrl } from "../auth.enum.js";
import { auth } from "../../../lib/auth.js";
import { createFetchRequest } from "../utils.js";

export default async function register(
  fastify: FastifyInstance,
): Promise<void> {
  const { authClientErrors } = fastify;
  const { throwUserAlreadyRegisteredError, errors } = authClientErrors;

  const version = "1.0.0";

  fastify.route({
    url: "/register",
    method: "POST",
    config: { public: true },
    constraints: { version },
    schema: {
      description: buildRouteFullDescription({
        api: "register",
        description: "Register a new user with email and password.",
        errors,
        version,
      }),
      body: registerEmailBodySchema,
      response: {
        200: baSignUpResponseSchema,
        422: baErrorSchema,
      },
    },
    handler: onRegister,
  });

  async function onRegister(
    req: FastifyRequest<{ Body: RegisterEmailBodySchemaType }>,
    reply: FastifyReply,
  ): Promise<BaSignUpResponseSchemaType> {
    const request = createFetchRequest(req, {
      baPath: BaUrl.SIGN_UP_EMAIL,
    });

    const response = await auth.handler(request);

    if (!response.ok) {
      await remapErrors(response);
    }

    reply.status(response.status);

    // setta i cookie della risposta BA alla risposta fastify (col cookie di auth)
    // response.headers.forEach((v, k) => reply.header(k, v));

    const body = (await response.json()) as BaSignUpResponseSchemaType;
    return { user: body.user };
  }

  async function remapErrors(response: Response): Promise<void> {
    const text = await response.text();
    let parsed: { message?: string; code?: string } | null = null;
    parsed = JSON.parse(text);

    // se autoSignIn:false non riceverà mai errore
    if (parsed?.code === BaError.USER_ALREADY_EXISTS) {
      return throwUserAlreadyRegisteredError();
    }
  }
}
