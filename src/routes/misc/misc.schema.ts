import { Static, Type } from "typebox";

export const statusResponseSchema = Type.Object(
  {
    status: Type.Literal("ok", {
      description: "Service status.",
    }),
    version: Type.String({
      minLength: 5,
      maxLength: 5,
      description: "Service version.",
    }),
  },
  { additionalProperties: false },
);
export type StatusResponseSchemaType = Static<typeof statusResponseSchema>;
