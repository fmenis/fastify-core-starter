import { describe, it, expect, vi, beforeEach } from "vitest";
import health from "./health.route.js";
import { createMockFastify } from "../../../test/utils/fastify.mock.js";
import { getServerVersion } from "../../../utils/utils.js";

//TODO capire perchè il mock buildRouteFullDescription non serve in read.route.test.ts
vi.mock("../../../utils/main.js", () => ({
  buildRouteFullDescription: vi.fn().mockReturnValue("Foo"),
  getServerVersion: vi.fn().mockResolvedValue("0.4.0"),
}));

describe("health.route", () => {
  describe("GET /health", () => {
    let mockFastify: ReturnType<typeof createMockFastify>;
    let version: string;

    beforeEach(async () => {
      mockFastify = createMockFastify();
      version = await getServerVersion();
    });

    async function getHandler() {
      await health(mockFastify as never);
      return mockFastify.capturedHandler!;
    }

    it("should return health ok with version", async () => {
      const handler = await getHandler();

      const result = await handler();

      expect(result).toEqual({
        health: "ok",
        version,
      });
    });
  });
});
