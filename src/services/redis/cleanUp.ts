import { redis } from "./redis.js";
import { REDIS_KEY_PREFIX } from "./constants.js";
import { getRequestItemCount } from "../../utils/getRequestItemCount.js";
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
  const requestItemCount = getRequestItemCount();

  const [nextCursor, keys] = await redis.scan(
    cursor,
    "MATCH",
    prefix,
    "COUNT",
    requestItemCount,
  );

  for (const key of keys) {
    await redis.zremrangebyscore(key, 0, cutoff);
  }

  return nextCursor;
};
