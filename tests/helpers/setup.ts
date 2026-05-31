import { afterAll, afterEach } from "vitest";
import { sql } from "kysely";
import { kysely } from "../../src/lib/kysely.js";

/**
 * Code executed after every test
 */
afterEach(async () => {
  await deleteData();
});

afterAll(async () => {
  await kysely.destroy();
});

/**
 * Dynamically deletes all data (expect in the migrations table)
 */
async function deleteData(): Promise<void> {
  const tables = await sql<{ table_name: string }>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type  = 'BASE TABLE'
      AND table_name NOT IN ('migrations')
  `.execute(kysely);

  const tableNames = tables.rows
    .map(({ table_name }) => `"${table_name}"`)
    .join(", ");

  await sql`TRUNCATE TABLE ${sql.raw(tableNames)} CASCADE`.execute(kysely);
}
