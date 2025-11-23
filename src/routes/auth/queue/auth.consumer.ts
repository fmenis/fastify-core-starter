import { FastifyInstance } from "fastify";
import { Worker, Job } from "bullmq";
import fp from "fastify-plugin";
import { sendResetPasswordEmail } from "./jobs/sendRestPasswordEmail.job.js";

export enum JOB_NAME {
  SEND_RESET_PASSWORD_EMAIL = "sendResetPasswordEmail",
}

async function authConsumer(fastify: FastifyInstance): Promise<void> {
  const { bullmq, log } = fastify;

  const { queue, connection } = bullmq;

  const worker = new Worker(
    queue.name,
    async (job: Job) => {
      switch (job.name) {
        case JOB_NAME.SEND_RESET_PASSWORD_EMAIL:
          await sendResetPasswordEmail(job.data);
          break;

        default:
          log.error(`Job ${job.name} has no associated handler`);
          break;
      }
    },
    { connection, name: "auth-consumer" },
  );

  //##TODO improve logs
  worker.on("completed", (job: Job, returnvalue: any) => {
    console.log(job);
    console.log(returnvalue);
  });

  worker.on("failed", (job: Job | undefined, error: Error, prev: string) => {
    console.log(job?.name);
    console.log(prev);
    log.error(error);
  });

  worker.on("error", err => {
    log.error(err);
  });
}

export default fp(authConsumer);
