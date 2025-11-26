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

const options: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
};

export const redisProducerClient: Redis = new Redis(options);

export const redisWorkerClient: Redis = new Redis(options);
