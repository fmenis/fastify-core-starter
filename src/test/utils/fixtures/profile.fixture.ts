import { faker } from "@faker-js/faker";
import { Profile } from "../../../modules/profile/profile.interface.js";

export function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    userName: faker.internet.username(),
    createdAt: faker.date.past(),
    updatedAt: faker.helpers.arrayElement([faker.date.recent(), null]),
    deletedAt: faker.helpers.arrayElement([faker.date.recent(), null]),
    ...overrides,
  };
}
