import { redis } from "./redis.js";
import { REDIS_KEY_PREFIX, DATABASE_REQUEST_ITEMS_COUNT } from "./contants.js";
import { TIME_RANGE_MAX } from "../../utils/constants.js";

export const cleanUpOldData = async () => {
  let offset = parseInt(process.env.VITE_ANALOG_TIME_RANGE as string, 10);

  if (isNaN(offset)) {
    offset = TIME_RANGE_MAX;
  }

  const cutoff = Date.now() - (offset + 1) * 24 * 60 * 60 * 1000;
  const pattern = `${REDIS_KEY_PREFIX}:*`;
  let cursor = "0";
  const requestItemsCount = parseInt(
    process.env.ANALOG_DATABASE_REQUEST_ITEM_COUNT as string,
    10,
  );

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      isNaN(requestItemsCount)
        ? DATABASE_REQUEST_ITEMS_COUNT
        : requestItemsCount,
    );
    cursor = nextCursor;

    for (const key of keys) {
      await redis.zremrangebyscore(key, 0, cutoff);
    }
  } while (cursor !== "0");
};
