import { redis } from "./redis";

export const resetData = () => {
  return redis.flushdb();
}