import { describe, it, expect, vi, beforeEach } from "vitest";
import { profileService } from "./profile.service.js";
import { EntityNotFoundError } from "../../common/errors.js";
import { createMockProfile } from "../../test/utils/fixtures/profile.fixture.js";
import { createMockProfileRepository } from "../../test/utils/fastify.mock.js";
import { randomUUID } from "node:crypto";

describe("profileService", () => {
  describe("findById", () => {
    let repository: ReturnType<typeof createMockProfileRepository>;
    let service: ReturnType<typeof profileService>;

    beforeEach(() => {
      ({ service, repository } = buildService());
    });

    it("returns the profile when found", async () => {
      const profile = createMockProfile({ deletedAt: null });
      vi.mocked(repository.findById).mockResolvedValue(profile);

      const result = await service.findById(profile.id);

      expect(repository.findById).toHaveBeenCalledOnce();
      expect(repository.findById).toHaveBeenCalledWith(profile.id);
      expect(result).toEqual(profile);
    });

    it("throws EntityNotFoundError when the profile does not exist", async () => {
      vi.mocked(repository.findById).mockResolvedValue(null);

      const id = randomUUID();
      await expect(service.findById(id)).rejects.toThrow(EntityNotFoundError);
      await expect(service.findById(id)).rejects.toMatchObject({
        entityName: "profile",
        entityId: id,
      });
    });
  });
});

function buildService() {
  const repository = createMockProfileRepository();
  const service = profileService({ profileRepository: repository } as never);
  return { service, repository };
}
