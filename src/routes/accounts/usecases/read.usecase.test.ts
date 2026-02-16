import { faker } from "@faker-js/faker";
import { describe, it, expect, beforeEach } from "vitest";
import readUseCase from "./read.usecase.js";
import {
  createMockFastify,
  createMockRequest,
} from "../../../test/utils/fastify.mock.js";
import { createMockAccount } from "../../../test/utils/fixtures/account.fixture.js";
import { EntityNotFoundError } from "../../../common/errors.js";

describe("read.usecase", () => {
  let mockFastify: ReturnType<typeof createMockFastify>;

  beforeEach(() => {
    mockFastify = createMockFastify();
  });

  async function getHandler() {
    await readUseCase(mockFastify as never);
    return mockFastify.capturedHandler!;
  }

  describe("when account exists", () => {
    it("should return the account data", async () => {
      const createdAt = faker.date.past();
      const updatedAt = faker.date.recent();
      const mockAccount = createMockAccount({ createdAt, updatedAt });

      mockFastify.accountService.findAccount.mockResolvedValueOnce(mockAccount);

      const handler = await getHandler();
      const request = createMockRequest({
        params: { id: mockAccount.id },
      });

      const result = await handler(request);

      expect(mockFastify.accountService.findAccount).toHaveBeenCalledWith(
        mockAccount.id,
      );
      expect(result).toEqual({
        id: mockAccount.id,
        firstName: mockAccount.firstName,
        lastName: mockAccount.lastName,
        userName: mockAccount.userName,
        email: mockAccount.email,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      });
    });
  });

  describe("when account does not exist", () => {
    it("should throw NOT_FOUND error", async () => {
      const nonExistentId = faker.string.uuid();

      mockFastify.accountService.findAccount.mockRejectedValueOnce(
        new EntityNotFoundError("account", nonExistentId),
      );

      const handler = await getHandler();
      const request = createMockRequest({
        params: { id: nonExistentId },
      });

      await expect(handler(request)).rejects.toThrow(
        `Entity 'account' with '${nonExistentId}' not found.`,
      );

      expect(
        mockFastify.commonClientErrors.throwNotFoundError,
      ).toHaveBeenCalledWith({
        id: nonExistentId,
        name: "account",
      });
    });
  });
});
