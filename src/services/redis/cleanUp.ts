import { redis } from "./redis.js";
import { REDIS_KEY_PREFIX } from "./contants.js";
import { getRequestItemsCount } from "../../utils/getRequestItemsCount.js";
import { getCutoff } from "../../utils/getCutoff.js";

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
  const cutoff = getCutoff();
  const prefix = `${REDIS_KEY_PREFIX}:*`;
  const requestItemsCount = getRequestItemsCount();

  const [nextCursor, keys] = await redis.scan(
    cursor,
    "MATCH",
    prefix,
    "COUNT",
    requestItemsCount,
  );

  for (const key of keys) {
    await redis.zremrangebyscore(key, 0, cutoff);
  }

  return nextCursor;
};
