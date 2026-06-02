import { faker } from "@faker-js/faker";
import { Selectable } from "kysely";
import { kysely } from "../../../src/lib/kysely.js";
import { Profile } from "../../../src/generated/kysely/types.js";

export async function seedProfile(
  overrides: {
    firstName?: string;
    lastName?: string;
    userName?: string;
    email?: string;
    password?: string;
  } = {},
): Promise<Selectable<Profile>> {
  return kysely
    .insertInto("profile")
    .values({
      firstName: overrides.firstName ?? faker.person.firstName(),
      lastName: overrides.lastName ?? faker.person.lastName(),
      userName: overrides.userName ?? faker.internet.username(),
      email: overrides.email ?? faker.internet.email(),
      password: overrides.password ?? faker.internet.password({ length: 20 }),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}
