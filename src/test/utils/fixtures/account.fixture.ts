import { faker } from "@faker-js/faker";
import { Account } from "../../../routes/accounts/account.interface.js";

export function createMockAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    userName: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 20 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}
