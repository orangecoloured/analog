import { uuid } from "../../utils";
import { redis, REDIS_KEY_PREFIX } from ".";

export const pushData = (event: string) => {
  const timestamp = Date.now();
  const member = `${timestamp}-${uuid()}`;
  const key = `${REDIS_KEY_PREFIX}:${event}`;

  return redis.zadd(key, timestamp, member);
}
