import { REDIS_KEY_PREFIX } from "../utils";
import { redis } from "./redis";

export const cleanUpOldData = async () => {
  const cutoff = Date.now() - parseInt(process.env.VITE_ANALOG_TIME_RANGE as string, 10) * 24 * 60 * 60 * 1000;
  const pattern = `${REDIS_KEY_PREFIX}:*`;
  let cursor = '0';

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;

    for (const key of keys) {
      await redis.zremrangebyscore(key, 0, cutoff);
    }
  } while (cursor !== '0');
}