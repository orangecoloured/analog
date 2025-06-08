import type { TData } from "../../utils";
import { REDIS_KEY_PREFIX } from "./contants.js";
import { redis } from "./redis.js";

export const getData = async(): Promise<TData> => {
  const data: TData = {};
  const prefix = `${REDIS_KEY_PREFIX}:`;
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100);
    cursor = nextCursor;

    for (const key of keys) {
      const event = key.slice(prefix.length);
      const timestamps = await redis.zrange(key, 0, -1, "WITHSCORES");

      data[event] = timestamps.filter((_, i) => i % 2 !== 0).map(Number)
    }
  } while (cursor !== "0")

  return data;
}
