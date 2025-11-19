import { Static, Type } from "@sinclair/typebox";

export const loginBodySchema = Type.Object(
  {
    email: Type.String({
      minLength: 3,
      maxLength: 100,
      description: "User email.",
    }),
    password: Type.String({
      minLength: 10,
      maxLength: 60,
      description: "User password.",
    }),
  },
  { additionalProperties: false },
);
export type loginBodySchemaType = Static<typeof loginBodySchema>;

export const loginResponseSchema = Type.Object(
  {
    jwt: Type.String({
      description: "JWT token.",
    }),
    foo: Type.Optional(
      Type.String({
        minLength: 10,
        maxLength: 60,
        description: "User password.",
      }),
    ),
  },
  { additionalProperties: false },
);
export type loginResponseSchemaType = Static<typeof loginResponseSchema>;
