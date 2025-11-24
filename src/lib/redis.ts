import { Redis, RedisOptions } from "ioredis";

const options: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
};

export const redisProducerClient: Redis = new Redis(options);

export const redisWorkerClient: Redis = new Redis(options);
