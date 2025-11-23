import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import { JOB_NAME } from "./auth.consumer.js";

declare module "fastify" {
  export interface FastifyInstance {
    authProducer: {
      queueResetPasswordEmailJob(params: { email: string }): Promise<void>;
    };
  }
}

async function AuthProducer(fastify: FastifyInstance): Promise<void> {
  const { bullmq } = fastify;

  async function queueResetPasswordEmailJob(params: {
    email: string;
  }): Promise<void> {
    await bullmq.queue.add(
      JOB_NAME.SEND_RESET_PASSWORD_EMAIL,
      {
        email: params.email,
      },
      { delay: 1000 },
    );
  }

  fastify.decorate("authProducer", {
    queueResetPasswordEmailJob,
  });
}

export default fp(AuthProducer);
