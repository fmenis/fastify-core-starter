import { describe, it, expect, vi, beforeEach } from "vitest";
import status from "./status.usecase.js";
import { createMockFastify } from "../../../test/utils/fastify.mock.js";

vi.mock("../../../utils/main.js", () => ({
  getServerVersion: vi.fn().mockResolvedValue("0.4.0"),
}));

describe("status.usecase", () => {
  describe("GET /status", () => {
    let mockFastify: ReturnType<typeof createMockFastify>;

    beforeEach(async () => {
      mockFastify = createMockFastify();
      await status(mockFastify as any);
    });

    it("should return status ok with version", async () => {
      const handler = mockFastify.capturedHandler;

      const result = await handler!();

      expect(result).toEqual({
        status: "ok",
        version: "0.4.0",
      });
    });
  });
});
