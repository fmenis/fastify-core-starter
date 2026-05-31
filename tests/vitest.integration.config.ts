import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/modules/**/*.test.ts"],
    globalSetup: ["tests/helpers/global-setup.ts"],
    setupFiles: ["tests/helpers/setup.ts"],
    // Run test files sequentially. Prevents concurrent files from interfering
    // on shared DB state and avoids race conditions on the kysely/redis singletons.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
