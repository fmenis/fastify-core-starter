import { describe, it, expect, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import { getTestApp } from "../../helpers/build-app.js";
import { getServerVersion } from "../../../src/utils/utils.js";

describe("GET /api/health", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  it("returns 200 with health status", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      health: "ok",
      version: await getServerVersion(),
    });
  });
});
