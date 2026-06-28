declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      APP_MODE: string;
      APP_ENV: string;
      APP_NAME: string;
      API_DOMAIN: string;
      SERVER_ADDRESS: string;
      SERVER_PORT: string;
      LOG_LEVEL: string;
      DATABASE_URL: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
      FRONTEND_ORIGIN: string;
      COOKIE_DOMAIN?: string;
      SENTRY_ENABLED: string;
      SENTRY_DSN?: string;
    }
  }
}

export {};
