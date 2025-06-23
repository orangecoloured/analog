import Redis, { type ChainableCommander } from "ioredis";

const connectionString = process.env.ANALOG_REDIS_URL as string;

export let redis: Redis;
export let pipeline: ChainableCommander;

if (connectionString) {
  redis = new Redis(connectionString, {
    lazyConnect: true,
    keepAlive: 1000,
    connectTimeout: 9000,
  });

  pipeline = redis.pipeline();
}
