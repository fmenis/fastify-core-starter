import kysely from "../../../lib/kysely.js";
import { loggerInstance } from "../../../lib/logger.js";

type SendResetPasswordEmailData = {
  email: string;
};

export async function sendResetPasswordEmail(
  data: SendResetPasswordEmailData,
): Promise<void> {
  const { email } = data;

  const profile = await kysely
    .selectFrom("profile")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (!profile) {
    loggerInstance.warn(`Profile with email '${email}' not found!`);
  }

  // send email
}
