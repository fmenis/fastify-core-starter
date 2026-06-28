/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi } from "vitest";
import type {
  MockProfileRepository,
  MockProfileService,
  MockCommonClientErrors,
  MockBullMQ,
  MockLogger,
  MockFastifyInstance,
} from "./types.js";

export function createMockProfileRepository(): MockProfileRepository {
  return {
    createProfile: vi.fn(),
    findById: vi.fn(),
  };
}

export function createMockProfileService(): MockProfileService {
  return {
    findById: vi.fn(),
  };
}

export function createMockCommonClientErrors(): MockCommonClientErrors {
  return {
    throwNotFoundError: vi.fn().mockImplementation(({ id, name }) => {
      const error = new Error(`Entity '${name}' with '${id}' not found.`);
      (error as any).statusCode = 404;
      (error as any).internalCode = "NOT_FOUND";
      throw error;
    }),
    errors: [
      {
        code: "*NOT_FOUND*",
        description: "occurs when the target entity is not present.",
        apis: ["login", "read profile"],
        statusCode: 404,
      },
    ],
  };
}

export function createMockBullMQ(): MockBullMQ {
  return {
    queue: {
      add: vi.fn().mockResolvedValue({ id: "mock-job-id" }),
    },
  };
}

export function createMockLogger(): MockLogger {
  return {
    level: "debug",
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(),
    fatal: vi.fn(),
    silent: vi.fn(),
    trace: vi.fn(),
  };
}

export interface CreateMockFastifyOptions {
  profileRepository?: Partial<MockProfileRepository>;
  profileService?: Partial<MockProfileService>;
  commonClientErrors?: Partial<MockCommonClientErrors>;
  bullmq?: Partial<MockBullMQ>;
}

export interface MockFastifyWithCapture extends MockFastifyInstance {
  capturedHandler: ((...args: any[]) => any) | null;
}

export function createMockFastify(
  options: CreateMockFastifyOptions = {},
): MockFastifyWithCapture {
  let capturedHandler: any = null;

  const mockFastify: MockFastifyWithCapture = {
    profileRepository: {
      ...createMockProfileRepository(),
      ...options.profileRepository,
    },
    profileService: {
      ...createMockProfileService(),
      ...options.profileService,
    },
    commonClientErrors: {
      ...createMockCommonClientErrors(),
      ...options.commonClientErrors,
    },
    bullmq: {
      ...createMockBullMQ(),
      ...options.bullmq,
    },
    log: createMockLogger(),
    route: vi.fn().mockImplementation((routeOptions: any) => {
      capturedHandler = routeOptions.handler;
    }),
    getSchema: vi.fn().mockReturnValue({}),
    get capturedHandler() {
      return capturedHandler;
    },
  };

  return mockFastify;
}

export function createMockRequest<
  T extends { Body?: any; Params?: any; Query?: any },
>(
  overrides: {
    body?: T["Body"];
    params?: T["Params"];
    query?: T["Query"];
  } = {},
) {
  return {
    body: overrides.body ?? {},
    params: overrides.params ?? {},
    query: overrides.query ?? {},
    log: createMockLogger(),
  };
}

export function createMockReply() {
  return {
    header: vi.fn(),
    status: vi.fn(),
  };
}

export function createMockFetchResponse(
  opts: {
    ok?: boolean;
    status?: number;
    headers?: Record<string, string>;
    body?: unknown;
  } = {},
): Response {
  const headersMap = opts.headers ?? {};
  return {
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    headers: {
      forEach: (cb: (v: string, k: string) => void) => {
        Object.entries(headersMap).forEach(([k, v]) => cb(v, k));
      },
    },
    json: vi.fn().mockResolvedValue(opts.body ?? {}),
  } as unknown as Response;
}
