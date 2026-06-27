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
    userId: Nullable(
      Type.String({
        format: "uuid",
        description: "Associated user ID.",
      }),
    ),
    firstName: Nullable(
      Type.String({
        description: "First name.",
      }),
    ),
    lastName: Nullable(
      Type.String({
        description: "Last name.",
      }),
    ),
    userName: Nullable(
      Type.String({
        description: "Username.",
      }),
    ),
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
