import type { Mock } from "vitest";

export interface MockAccountRepository {
  createAccount: Mock;
  findByEmail: Mock;
  findById: Mock;
}

export interface MockCommonClientErrors {
  throwNotFoundError: Mock;
  errors: Array<{
    code: string;
    description: string;
    apis: string[];
    statusCode: number;
  }>;
}

export interface MockBullMQ {
  queue: {
    add: Mock;
  };
}

export interface MockLogger {
  level: string;
  debug: Mock;
  info: Mock;
  warn: Mock;
  error: Mock;
  child: Mock;
  trace: Mock;
  fatal: Mock;
  silent: Mock;
}

export interface MockFastifyInstance {
  accountRepository: MockAccountRepository;
  commonClientErrors: MockCommonClientErrors;
  bullmq: MockBullMQ;
  log: MockLogger;
}
