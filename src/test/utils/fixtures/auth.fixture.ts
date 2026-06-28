import { faker } from "@faker-js/faker";
import { Static } from "typebox";
import { baUserSchema } from "../../../modules/auth/auth.schema.js";

type BaUser = Static<typeof baUserSchema>;

export function createMockBaUser(overrides: Partial<BaUser> = {}): BaUser {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: false,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
