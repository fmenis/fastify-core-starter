import { Worker, Job } from "bullmq";

import { redisWorkerClient } from "../../../lib/redis.js";
import { knexInstance } from "../../../lib/knex.js";
import { loggerInstance } from "../../../lib/logger.js";

export enum JOB_NAME {
  SEND_RESET_PASSWORD_EMAIL = "sendResetPasswordEmail",
}

export const emailWorker = new Worker(
  "my-queue",
  async (job: Job): Promise<void> => {
    return sendResetPasswordEmail(job.data);
  },
  { connection: redisWorkerClient },
);

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
