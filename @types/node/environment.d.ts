declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      APP_ENV: string;
      APP_NAME: string;
      API_DOMAIN: string;
      SERVER_ADDRESS: string;
      SERVER_PORT: string;
      LOG_LEVEL: string;
      DATABASE_URL: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      SENTRY_ENABLED: boolean;
      SENTRY_DSN: string;
    }
  }
}

export {};
