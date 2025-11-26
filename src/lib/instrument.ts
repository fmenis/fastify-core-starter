import * as Sentry from "@sentry/node";

if (process.env.SENTRY_ENABLED) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sendDefaultPii: true,
    environment: process.env.APP_ENV,
    attachStacktrace: true,
  });
}
