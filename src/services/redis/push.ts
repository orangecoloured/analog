import { uuid } from "../../utils/uuid.js";
import { redis } from "./redis.js";
import { REDIS_KEY_PREFIX } from "./constants.js";

export const pushData = (event: string) => {
  const timestamp = Date.now();
  const member = `${timestamp}-${uuid()}`;
  const key = `${REDIS_KEY_PREFIX}:${event}`;

  return redis.zadd(key, timestamp, member);
};
