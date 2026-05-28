import kysely from "../../../lib/kysely.js";
import { loggerInstance } from "../../../lib/logger.js";

type SendResetPasswordEmailData = {
  email: string;
};

export async function sendResetPasswordEmail(
  data: SendResetPasswordEmailData,
): Promise<void> {
  const { email } = data;

  const account = await kysely
    .selectFrom("account")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (!account) {
    loggerInstance.warn(`Account with email '${email}' not found!`);
  }

  // send email
}
