import * as Sentry from "@sentry/node";
import { loggerInstance } from "./logger.js";

if (process.env.SENTRY_ENABLED === "true") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sendDefaultPii: true, // potentially gdpr issue (user specific info sent to sentry)
    environment: process.env.APP_ENV,
    attachStacktrace: true,
  });

  loggerInstance.debug("Sentry correctly initialized");
}
