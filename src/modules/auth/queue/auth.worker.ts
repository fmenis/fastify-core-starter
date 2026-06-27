import kysely from "../../../lib/kysely.js";
import { loggerInstance } from "../../../lib/logger.js";

type SendResetPasswordEmailData = {
  email: string;
};

export async function sendResetPasswordEmail(
  data: SendResetPasswordEmailData,
): Promise<void> {
  const { email } = data;

  const user = await kysely
    .selectFrom("user")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (!user) {
    loggerInstance.warn(`User with email '${email}' not found!`);
  }

  // send email
}
