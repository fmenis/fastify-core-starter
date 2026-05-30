import { Static, Type } from "typebox";

export const healthResponseSchema = Type.Object(
  {
    health: Type.Literal("ok", {
      description: "Service health.",
    }),
    version: Type.String({
      minLength: 5,
      maxLength: 5,
      description: "Service version.",
    }),
  },
  { additionalProperties: false },
);
export type HealthResponseSchemaType = Static<typeof healthResponseSchema>;
