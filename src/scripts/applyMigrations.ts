import Postgrator from "postgrator";
import pg from "pg";
import { join, resolve } from "path";

async function applyMigrations(): Promise<void> {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  const schema = "public";
  const database = new URL(process.env.DATABASE_URL!).pathname.slice(1);

  try {
    await client.connect();

    const postgrator = new Postgrator({
      migrationPattern: join(resolve(), "/migrations/*"),
      driver: "pg",
      database,
      schemaTable: "migrations",
      currentSchema: schema,
      execQuery: query => client.query(query),
    });

    postgrator.on("migration-started", migration =>
      console.info(
        `Start to execute '${migration.name}' (${migration.action}) migration...`,
      ),
    );

    postgrator.on("migration-finished", migration =>
      console.info(
        `Migration '${migration.name}' (${migration.action}) successfully applied! \n`,
      ),
    );

    const results = await postgrator.migrate();

    if (results.length === 0) {
      console.info(
        `No migrations run for schema '${schema}'. Db '${database}' already at the latest version.`,
      );
    } else {
      console.info(`${results.length} migration/s applied.`);
    }
  } catch (error) {
    console.error("Error during migrations application");

    throw error;
  } finally {
    await client.end();
  }
}

applyMigrations();
