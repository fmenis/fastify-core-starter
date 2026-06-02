import { Static, Type } from "typebox";
import { Nullable } from "../../common/schema.js";

export const readProfileParamsSchema = Type.Object(
  {
    id: Type.String({
      format: "uuid",
      description: "Profile ID.",
    }),
  },
  { additionalProperties: false },
);
export type ReadProfileParamsSchemaType = Static<
  typeof readProfileParamsSchema
>;

export const readProfileResponseSchema = Type.Object(
  {
    id: Type.String({
      format: "uuid",
      description: "Profile ID.",
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
      description: "Profile creation date.",
    }),
    updatedAt: Nullable(
      Type.String({
        format: "date-time",
        description: "Profile last update date.",
      }),
    ),
    deletedAt: Nullable(
      Type.String({
        format: "date-time",
        description: "Profile deletion date.",
      }),
    ),
  },
  { additionalProperties: false },
);
export type ReadProfileResponseSchemaType = Static<
  typeof readProfileResponseSchema
>;
