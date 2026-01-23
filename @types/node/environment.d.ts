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
      PG_HOST: string;
      PG_PORT: string;
      PG_DB: string;
      PG_USER: string;
      PG_PW: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      SENTRY_ENABLED: boolean;
      SENTRY_DSN: string;
    }
  }
}

export {};
