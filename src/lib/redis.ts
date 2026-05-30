/**
 * Dedicated Redis clients for BullMQ.
 *
 * - Producer and Worker/QueueEvents must not share the same connection:
 *   BullMQ uses blocking commands that can freeze producers if reused.
 *
 * - redisProducerClient → used only to enqueue jobs.
 * - redisWorkerClient → used only by Workers and QueueEvents.
 *
 * - maxRetriesPerRequest: null is required for BullMQ internals.
 */

import { Redis, RedisOptions } from "ioredis";
import { loggerInstance } from "./logger.js";

const options: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
  lazyConnect: true,
};

export const redisProducerClient = new Redis(options);
export const redisWorkerClient = new Redis(options);

redisProducerClient.on("error", err => {
  loggerInstance.error({ err }, "Redis producer client error");
});

redisWorkerClient.on("error", err => {
  loggerInstance.error({ err }, "Redis worker client error");
});

try {
  await redisProducerClient.connect();
  await redisWorkerClient.connect();
  loggerInstance.debug("Redis connections verified");
} catch (err) {
  loggerInstance.fatal({ err }, "Failed to connect to Redis — aborting");
  process.exit(1);
}
