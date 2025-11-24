import { Worker, Job } from "bullmq";

import { redisWorkerClient } from "../../../lib/redis.js";
import { knexInstance } from "../../../lib/knex.js";
import { loggerInstance } from "../../../lib/logger.js";
import { QUEUE_NAME } from "../../../common/constants.js";

export const emailWorker = new Worker(
  QUEUE_NAME,
  async (job: Job): Promise<void> => {
    return sendResetPasswordEmail(job.data);
  },
  { connection: redisWorkerClient },
);

emailWorker.on("error", err => {
  loggerInstance.error(err);
});

type Data = {
  email: string;
};

export async function sendResetPasswordEmail(data: Data): Promise<void> {
  const { email } = data;

  const account = await knexInstance("account")
    .select("*")
    .where({ email: data.email })
    .first();

  if (!account) {
    loggerInstance.warn(`Account with email '${email}' not found!`);
  }

  // send email
}
