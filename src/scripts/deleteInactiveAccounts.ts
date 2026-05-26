import { runScript } from "./helpers/runScript.js";

runScript(async fastify => {
  const { kysely } = fastify;

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const result = await kysely
    .updateTable("account")
    .set({ deletedAt: new Date() })
    .where("updatedAt", "<", oneYearAgo)
    .where("deletedAt", "is", null)
    .executeTakeFirst();

  fastify.log.info(
    { count: result.numUpdatedRows.toString() },
    "soft-deleted inactive accounts",
  );
});
