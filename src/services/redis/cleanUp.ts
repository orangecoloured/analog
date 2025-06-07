import { REDIS_KEY_PREFIX, redis } from ".";
import { TIME_RANGE_MAX } from "../../utils";

export const cleanUpOldData = async () => {
  let offset = parseInt(process.env.VITE_ANALOG_TIME_RANGE as string, 10);

  if (isNaN(offset)) {
    offset = TIME_RANGE_MAX;
  }

  const cutoff = Date.now() - ((offset + 1) * 24 * 60 * 60 * 1000);
  const pattern = `${REDIS_KEY_PREFIX}:*`;
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;

    for (const key of keys) {
      await redis.zremrangebyscore(key, 0, cutoff);
    }
  } while (cursor !== "0");
}
