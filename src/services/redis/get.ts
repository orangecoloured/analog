import type { TData, TPaginatedData } from "../../utils";
import { REDIS_KEY_PREFIX, DATABASE_REQUEST_ITEMS_COUNT } from "./contants.js";
import { redis } from "./redis.js";

export const getAllData = async (): Promise<TData> => {
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
    const event = key.slice(prefix.length);
    const timestamps = await redis.zrange(key, 0, -1, "WITHSCORES");

    data[event] = timestamps.filter((_, i) => i % 2 !== 0).map(Number);
  }

  return {
    data,
    nextCursor,
  };
};
