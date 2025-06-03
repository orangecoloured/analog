import { REDIS_KEY_PREFIX, uuid } from "../utils";
import { redis } from "./redis";

export const pushData = (path: string) => {
  const timestamp = Date.now();
  const member = `${timestamp}-${uuid()}`;
  const key = `${REDIS_KEY_PREFIX}:${path}`;
  
  return redis.zadd(key, timestamp, member);
}