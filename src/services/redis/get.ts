import type { TData, TPaginatedData } from "../../utils";
import { getRequestItemsCount } from "../../utils/getRequestItemsCount.js";
import { REDIS_KEY_PREFIX } from "./contants.js";
import { redis } from "./redis.js";

export const getAllData = async () => {
  const data: TData = {};

  let cursor = "0";

  do {
    const response = await getDataByCursor(cursor);

    cursor = response.nextCursor;

    for (const [key, value] of Object.entries(response.data)) {
      if (!data[key]) {
        data[key] = response.data[key];
      } else {
        data[key] = data[key].concat(value);
      }
    }
  } while (cursor !== "0");

  return data;
};

export const getDataByCursor = async (
  cursor: string = "0",
): Promise<TPaginatedData> => {
  const data: TData = {};
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
    const event = key.slice(prefix.length);
    const timestamps = await redis.zrange(key, 0, -1, "WITHSCORES");

    data[event] = timestamps.filter((_, i) => i % 2 !== 0).map(Number);
  }

  return {
    data,
    nextCursor,
  };
};
