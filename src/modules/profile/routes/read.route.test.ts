import { faker } from "@faker-js/faker";
import { describe, it, expect, beforeEach } from "vitest";
import readRoute from "./read.route.js";
import {
  createMockFastify,
  createMockRequest,
} from "../../../test/utils/fastify.mock.js";
import { createMockProfile } from "../../../test/utils/fixtures/profile.fixture.js";
import { EntityNotFoundError } from "../../../common/errors.js";

describe("read.route", () => {
  let mockFastify: ReturnType<typeof createMockFastify>;

  beforeEach(() => {
    mockFastify = createMockFastify();
  });

  async function getHandler() {
    await readRoute(mockFastify as never);
    return mockFastify.capturedHandler!;
  }

  describe("when profile exists", () => {
    it("should return the profile data", async () => {
      const createdAt = faker.date.past();
      const updatedAt = faker.date.recent();
      const deletedAt = null;

      const mockProfile = createMockProfile({
        createdAt,
        updatedAt,
        deletedAt,
      });

      mockFastify.profileService.findById.mockResolvedValueOnce(mockProfile);

      const handler = await getHandler();
      const request = createMockRequest({
        params: { id: mockProfile.id },
      });

      const result = await handler(request);

      expect(mockFastify.profileService.findById).toHaveBeenCalledWith(
        mockProfile.id,
      );
      expect(result).toEqual({
        id: mockProfile.id,
        userId: mockProfile.userId,
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        userName: mockProfile.userName,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        deletedAt: deletedAt,
      });
    });
  });

  describe("when profile does not exist", () => {
    it("should throw NOT_FOUND error", async () => {
      const nonExistentId = faker.string.uuid();

      mockFastify.profileService.findById.mockRejectedValueOnce(
        new EntityNotFoundError("profile", nonExistentId),
      );

      const handler = await getHandler();
      const request = createMockRequest({
        params: { id: nonExistentId },
      });

      await expect(handler(request)).rejects.toThrow(
        `Entity 'profile' with '${nonExistentId}' not found.`,
      );

      expect(
        mockFastify.commonClientErrors.throwNotFoundError,
      ).toHaveBeenCalledWith({
        id: nonExistentId,
        name: "profile",
      });
    });
  });
});
