import Redis from "ioredis";

export const redis = new Redis(process.env.ANALOG_REDIS_URL as string);
export const pipeline = redis.pipeline();
