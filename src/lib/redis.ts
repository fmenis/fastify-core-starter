import IORedis, { Redis, RedisOptions } from "ioredis";

const options: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
};

export const redisProducerClient: Redis = new IORedis(options);

export const redisWorkerClient: Redis = new IORedis(options);
