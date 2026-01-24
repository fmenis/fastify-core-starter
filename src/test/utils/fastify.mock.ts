/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi } from "vitest";
import type {
  MockAccountRepository,
  MockCommonClientErrors,
  MockBullMQ,
  MockLogger,
  MockFastifyInstance,
} from "./types.js";

export function createMockAccountRepository(): MockAccountRepository {
  return {
    createAccount: vi.fn(),
    findByEmail: vi.fn(),
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
        apis: ["login", "read account"],
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
  accountRepository?: Partial<MockAccountRepository>;
  commonClientErrors?: Partial<MockCommonClientErrors>;
  bullmq?: Partial<MockBullMQ>;
}

export interface MockFastifyWithCapture extends MockFastifyInstance {
  capturedHandler: ((...args: any[]) => any) | null;
}

export function createMockFastify(
  options: CreateMockFastifyOptions = {},
): MockFastifyWithCapture {
  const capturedHandler: any = null;

  const mockFastify: MockFastifyWithCapture = {
    accountRepository: {
      ...createMockAccountRepository(),
      ...options.accountRepository,
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
