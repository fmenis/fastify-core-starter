import { describe, it, expect, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { getTestApp } from "../../helpers/build-app.js";
import { Selectable } from "kysely";
import { Profile } from "../../../src/generated/kysely/types.js";
import { seedProfile } from "./profile.seed.js";

const VERSION_HEADER = { "accept-version": "1.0.0" };
const BASE_API_URL = "/api/profile";

describe(`GET ${BASE_API_URL}/:id`, () => {
  let app: FastifyInstance;
  let profile: Selectable<Profile>;

  beforeAll(async () => {
    app = await getTestApp();
    profile = await seedProfile();
  });

  it("returns 200 with profile data for an existing profile", async () => {
    const response = await app.inject({
      method: "GET",
      url: `${BASE_API_URL}/${profile.id}`,
      headers: VERSION_HEADER,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      userName: profile.userName,
      email: profile.email,
      createdAt: expect.any(String),
      updatedAt: null,
      deletedAt: null,
    });
  });

  //##TODO approfondimento su cosa deve fare ogni layer di test
  it("returns 404 when profile does not exist", async () => {
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
    const profile = await seedProfile();

    const response = await app.inject({
      method: "GET",
      url: `${BASE_API_URL}/${profile.id}`,
    });

    expect(response.statusCode).toBe(404);
  });
});
