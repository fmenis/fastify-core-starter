import { loggerInstance } from "../../../lib/logger.js";

export async function handleDeleteInactiveAccounts(
  jobId: string,
): Promise<void> {
  loggerInstance.info({ jobId }, "delete-inactive-accounts: started");

  // const oneYearAgo = new Date();
  // oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // const result = await kysely
  //   .updateTable("account")
  //   .set({ deletedAt: new Date() })
  //   .where("updatedAt", "<", oneYearAgo)
  //   .where("deletedAt", "is", null)
  //   .executeTakeFirst();

  // loggerInstance.info(
  //   { jobId, count: result.numUpdatedRows.toString() },
  //   "delete-inactive-accounts: completed",
  // );

  loggerInstance.info({ jobId }, "delete-inactive-accounts: completed");
}
