import { Static, Type } from "typebox";

import { Nullable } from "../../common/schema.js";

export const baUserSchema = Type.Object(
  {
    id: Type.String({ format: "uuid", description: "User ID." }),
    name: Type.String({ description: "Display name." }),
    email: Type.String({ format: "email", description: "Email address." }),
    emailVerified: Type.Boolean({ description: "Whether the email is verified." }),
    image: Nullable(Type.String({ description: "Profile image URL." })),
    createdAt: Type.String({ format: "date-time", description: "Creation date." }),
    updatedAt: Type.String({ format: "date-time", description: "Last update date." }),
  },
  { additionalProperties: false },
);

export const baErrorSchema = Type.Object(
  {
    statusCode: Type.Integer({ description: "Http status code." }),
    error: Type.String({ description: "Http error." }),
    message: Type.String({ description: "Message." }),
    internalCode: Type.String({ description: "Internal code." }),
    details: Type.Any(),
  },
  {
    additionalProperties: false,
    description: "Better Auth error.",
  },
);

export const signUpEmailBodySchema = Type.Object(
  {
    name: Type.String({ description: "Display name." }),
    email: Type.String({ format: "email", description: "Email address." }),
    password: Type.String({
      minLength: 8,
      maxLength: 128,
      description: "Password (8–128 chars).",
    }),
    image: Type.Optional(Type.String({ description: "Profile image URL." })),
  },
  { additionalProperties: false },
);
export type SignUpEmailBodySchemaType = Static<typeof signUpEmailBodySchema>;

export const signInEmailBodySchema = Type.Object(
  {
    email: Type.String({ format: "email", description: "Email address." }),
    password: Type.String({ description: "Password." }),
    rememberMe: Type.Optional(
      Type.Boolean({ description: "Keep session alive when browser closes." }),
    ),
  },
  { additionalProperties: false },
);
export type SignInEmailBodySchemaType = Static<typeof signInEmailBodySchema>;

export const baAuthResponseSchema = Type.Object(
  {
    token: Type.String({ description: "Session token." }),
    user: baUserSchema,
  },
  { additionalProperties: false },
);
export type BaAuthResponseSchemaType = Static<typeof baAuthResponseSchema>;

export const baSignUpResponseSchema = Type.Object(
  { user: baUserSchema },
  { additionalProperties: false },
);
export type BaSignUpResponseSchemaType = Static<typeof baSignUpResponseSchema>;

export const baSignOutResponseSchema = Type.Object(
  {
    success: Type.Boolean({ description: "Whether the sign-out was successful." }),
  },
  { additionalProperties: false },
);

export const baTokenResponseSchema = Type.Object(
  {
    token: Type.String({ description: "JWT access token (15 min expiry)." }),
  },
  { additionalProperties: false },
);
export type BaTokenResponseSchemaType = Static<typeof baTokenResponseSchema>;

export const baJwksResponseSchema = Type.Object(
  {
    keys: Type.Array(
      Type.Object(
        {
          kty: Type.String({ description: "Key type." }),
          crv: Type.String({ description: "Curve." }),
          x: Type.String({ description: "Public key coordinate." }),
          kid: Type.String({ description: "Key ID." }),
        },
        { additionalProperties: false },
      ),
      { description: "List of public JSON Web Keys." },
    ),
  },
  { additionalProperties: false },
);

const baSessionSchema = Type.Object(
  {
    id: Type.String({ format: "uuid", description: "Session ID." }),
    userId: Type.String({ format: "uuid", description: "User ID." }),
    token: Type.String({ description: "Session token." }),
    expiresAt: Type.String({ format: "date-time", description: "Expiry date." }),
    createdAt: Type.String({ format: "date-time", description: "Creation date." }),
    updatedAt: Type.String({ format: "date-time", description: "Last update date." }),
    ipAddress: Nullable(Type.String({ description: "Client IP address." })),
    userAgent: Nullable(Type.String({ description: "Client user agent." })),
  },
  { additionalProperties: false },
);

export const baGetSessionResponseSchema = Nullable(
  Type.Object(
    {
      session: baSessionSchema,
      user: baUserSchema,
    },
    { additionalProperties: false },
  ),
);
