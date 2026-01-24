import { describe, it, expect, vi, beforeEach } from "vitest";
import status from "./status.usecase.js";
import { createMockFastify } from "../../../test/utils/fastify.mock.js";

vi.mock("../../../utils/main.js", () => ({
  buildRouteFullDescription: vi.fn().mockReturnValue("Foo"),
  getServerVersion: vi.fn().mockResolvedValue("0.4.0"),
}));

describe("status.usecase", () => {
  describe("GET /status", () => {
    let mockFastify: ReturnType<typeof createMockFastify>;

    beforeEach(async () => {
      mockFastify = createMockFastify();
    });

    async function getHandler() {
      await status(mockFastify as never);
      return mockFastify.capturedHandler!;
    }

    it("should return status ok with version", async () => {
      const handler = await getHandler();

      const result = await handler();

      expect(result).toEqual({
        status: "ok",
        version: "0.4.0",
      });
    });
  });
});
