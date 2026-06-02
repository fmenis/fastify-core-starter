import { loggerInstance } from "../../../lib/logger.js";

export async function handleDeleteInactiveProfiles(
  jobId: string,
): Promise<void> {
  loggerInstance.info({ jobId }, "delete-inactive-profiles: started");

  // const oneYearAgo = new Date();
  // oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // const result = await kysely
  //   .updateTable("profile")
  //   .set({ deletedAt: new Date() })
  //   .where("updatedAt", "<", oneYearAgo)
  //   .where("deletedAt", "is", null)
  //   .executeTakeFirst();

  // loggerInstance.info(
  //   { jobId, count: result.numUpdatedRows.toString() },
  //   "delete-inactive-profiles: completed",
  // );

  loggerInstance.info({ jobId }, "delete-inactive-profiles: completed");
}
