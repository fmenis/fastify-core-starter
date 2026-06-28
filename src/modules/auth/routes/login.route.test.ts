import { vi, describe, it, expect, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import {
  createMockFastify,
  createMockRequest,
  createMockFetchResponse,
  createMockReply,
} from "../../../test/utils/fastify.mock.js";
import login from "./login.route.js";
import { BaUrl } from "../auth.enum.js";
import type { BaAuthResponseSchemaType } from "../auth.schema.js";
import { auth } from "../../../lib/auth.js";
import { createFetchRequest, throwException } from "../utils.js";
import { createMockBaUser } from "../../../test/utils/fixtures/auth.fixture.js";

vi.mock("../../../lib/auth.js", () => ({
  auth: { handler: vi.fn() },
}));

vi.mock("../utils.js", () => ({
  createFetchRequest: vi.fn(),
  throwException: vi.fn(),
}));

describe("login.route", () => {
  let mockFastify: ReturnType<typeof createMockFastify>;

  beforeEach(() => {
    mockFastify = createMockFastify();
    vi.mocked(createFetchRequest).mockReturnValueOnce({} as Request);
  });

  async function getHandler() {
    await login(mockFastify as never);
    return mockFastify.capturedHandler!;
  }

  describe("on successful login", () => {
    it("returns token and user from BA response", async () => {
      const handler = await getHandler();

      const expectedBody: BaAuthResponseSchemaType = {
        token: faker.string.alphanumeric(40),
        user: createMockBaUser(),
      };

      vi.mocked(auth.handler).mockResolvedValueOnce(
        createMockFetchResponse({ body: expectedBody }),
      );

      const result = await handler(
        createMockRequest({
          body: {
            email: faker.internet.email,
            password: faker.internet.password(),
          },
        }),
        createMockReply(),
      );

      expect(result).toEqual(expectedBody);
    });

    it("sets reply status from BA response", async () => {
      const status = 200;
      const handler = await getHandler();

      vi.mocked(auth.handler).mockResolvedValue(
        createMockFetchResponse({
          status,
          body: { token: "t", user: createMockBaUser() },
        }),
      );

      const reply = createMockReply();
      await handler(createMockRequest(), reply);

      expect(reply.status).toHaveBeenCalledWith(status);
    });

    it("forwards headers from BA response to reply", async () => {
      const handler = await getHandler();
      const sessionCookie = "session_token=abc; Path=/; HttpOnly";

      vi.mocked(auth.handler).mockResolvedValue(
        createMockFetchResponse({
          headers: { "set-cookie": sessionCookie },
        }),
      );

      const reply = createMockReply();
      await handler(createMockRequest(), reply);

      expect(reply.header).toHaveBeenCalledWith("set-cookie", sessionCookie);
    });

    it("calls createFetchRequest with the sign-in BA path", async () => {
      const handler = await getHandler();

      const req = createMockRequest({
        body: {
          email: faker.internet.email,
          password: faker.internet.password(),
        },
      });

      vi.mocked(auth.handler).mockResolvedValue(createMockFetchResponse());

      await handler(req, createMockReply());

      expect(createFetchRequest).toHaveBeenCalledWith(req, {
        baPath: BaUrl.SIGN_IN_EMAIL,
      });
    });
  });

  describe("on BA error", () => {
    it("calls throwException and propagates the error", async () => {
      const handler = await getHandler();
      const errorResponse = createMockFetchResponse({ ok: false, status: 401 });

      vi.mocked(auth.handler).mockResolvedValue(errorResponse);

      vi.mocked(throwException).mockRejectedValue(
        Object.assign(new Error("Invalid credentials"), {
          statusCode: 401,
          internalCode: "INVALID_EMAIL_OR_PASSWORD",
        }),
      );

      await expect(
        handler(createMockRequest(), createMockReply()),
      ).rejects.toMatchObject({
        statusCode: 401,
        internalCode: "INVALID_EMAIL_OR_PASSWORD",
      });

      expect(throwException).toHaveBeenCalledWith(errorResponse);
    });
  });
});
