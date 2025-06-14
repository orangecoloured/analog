import Redis from "ioredis";

export const redis = new Redis(process.env.ANALOG_REDIS_URL as string, {
  lazyConnect: true,
  keepAlive: 1000,
  connectTimeout: 9000,
});
export const pipeline = redis.pipeline();
