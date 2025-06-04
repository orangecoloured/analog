import { REDIS_KEY_PREFIX, uuid } from "../utils";
import { redis } from "./redis";

export const pushData = (event: string) => {
  const timestamp = Date.now();
  const member = `${timestamp}-${uuid()}`;
  const key = `${REDIS_KEY_PREFIX}:${event}`;
  
  return redis.zadd(key, timestamp, member);
}