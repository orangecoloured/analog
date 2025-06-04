import { REDIS_KEY_PREFIX, TIME_RANGE_MAX } from "../utils";
import { redis } from "./redis";

const cleanUpOldData = async () => {
  let offset = parseInt(process.env.VITE_ANALOG_TIME_RANGE as string, 10);

  if (isNaN(offset)) {
    offset = TIME_RANGE_MAX;
  }

  const cutoff = Date.now() - (offset * 24 * 60 * 60 * 1000);
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

export default cleanUpOldData;