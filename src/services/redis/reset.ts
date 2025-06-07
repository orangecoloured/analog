import { redis } from ".";

export const resetData = () => {
  return redis.flushdb();
}
