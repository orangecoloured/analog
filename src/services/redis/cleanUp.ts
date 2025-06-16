import { redis } from "./redis.js";
import { REDIS_KEY_PREFIX, DATABASE_REQUEST_ITEMS_COUNT } from "./contants.js";
import { TIME_RANGE_MAX } from "../../utils/constants.js";

export const cleanUpAllData = async (): Promise<"OK"> => {
  let cursor = "0";

  do {
    cursor = await cleanUpDataByCursor(cursor);
  } while (cursor !== "0");

  return "OK";
};

export const cleanUpDataByCursor = async (
  cursor: string = "0",
): Promise<string> => {
  let offset = parseInt(process.env.VITE_ANALOG_TIME_RANGE as string, 10);

  if (isNaN(offset)) {
    offset = TIME_RANGE_MAX;
  }

  const cutoff = Date.now() - (offset + 1) * 24 * 60 * 60 * 1000;
  const prefix = `${REDIS_KEY_PREFIX}:*`;
  const requestItemsCount = parseInt(
    process.env.ANALOG_DATABASE_REQUEST_ITEM_COUNT as string,
    10,
  );

  const [nextCursor, keys] = await redis.scan(
    cursor,
    "MATCH",
    prefix,
    "COUNT",
    isNaN(requestItemsCount) ? DATABASE_REQUEST_ITEMS_COUNT : requestItemsCount,
  );

  for (const key of keys) {
    await redis.zremrangebyscore(key, 0, cutoff);
  }

  return nextCursor;
};
