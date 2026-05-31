import dotenv from "dotenv";
import { execSync } from "child_process";

/**
 * Code executed once before the test workers
 */
export async function setup(): Promise<void> {
  dotenv.config({ path: "tests/.env.test" });

  try {
    execSync(
      "npx tsx --env-file tests/.env.test src/scripts/applyMigrations.ts",
      {
        stdio: "inherit",
      },
    );
  } catch (err) {
    throw new Error(
      `Integration test setup failed: migration error.\n` +
        `Make sure "docker compose -f docker-compose.test.yml up -d --wait" is running.\n` +
        `Original error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export async function teardown(): Promise<void> {
  // Workers exited via forceExit: true.
  // docker compose down is handled by the npm script.
}
