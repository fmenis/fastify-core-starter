import { describe, it, expect, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { getTestApp } from "../../helpers/build-app.js";
import { Selectable } from "kysely";
import { Account } from "../../../src/generated/kysely/types.js";
import { seedAccount } from "./account.seed.js";

const VERSION_HEADER = { "accept-version": "1.0.0" };
const BASE_API_URL = "/api/accounts";

describe(`GET ${BASE_API_URL}/:id`, () => {
  let app: FastifyInstance;
  let account: Selectable<Account>;

  beforeAll(async () => {
    app = await getTestApp();
    account = await seedAccount();
  });

  it("returns 200 with account data for an existing account", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${BASE_API_URL}/${account.id}`,
      headers: VERSION_HEADER,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      userName: account.userName,
      email: account.email,
      createdAt: expect.any(String),
      updatedAt: null,
      deletedAt: null,
    });
  });

  //##TODO approfondimento su cosa deve fare ogni layer di test
  it("returns 404 when account does not exist", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${BASE_API_URL}/${randomUUID()}`,
      headers: VERSION_HEADER,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      statusCode: 404,
      internalCode: "NOT_FOUND",
    });
  });

  it("returns 404 when Accept-Version header is missing", async () => {
    const account = await seedAccount();

    const response = await app.inject({
      method: "GET",
      url: `${BASE_API_URL}/${account.id}`,
    });

    expect(response.statusCode).toBe(404);
  });
});
