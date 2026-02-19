import { Static, Type } from "typebox";
import { Nullable } from "../../common/schema.js";

export const readAccountParamsSchema = Type.Object(
  {
    id: Type.String({
      format: "uuid",
      description: "Account ID.",
    }),
  },
  { additionalProperties: false },
);
export type ReadAccountParamsSchemaType = Static<
  typeof readAccountParamsSchema
>;

export const readAccountResponseSchema = Type.Object(
  {
    id: Type.String({
      format: "uuid",
      description: "Account ID.",
    }),
    firstName: Type.String({
      description: "First name.",
    }),
    lastName: Type.String({
      description: "Last name.",
    }),
    userName: Type.String({
      description: "Username.",
    }),
    email: Type.String({
      format: "email",
      description: "Email address.",
    }),
    createdAt: Type.String({
      format: "date-time",
      description: "Account creation date.",
    }),
    updatedAt: Nullable(
      Type.String({
        format: "date-time",
        description: "Account last update date.",
      }),
    ),
    deletedAt: Nullable(
      Type.String({
        format: "date-time",
        description: "Account last update date.",
      }),
    ),
  },
  { additionalProperties: false },
);
export type ReadAccountResponseSchemaType = Static<
  typeof readAccountResponseSchema
>;
