import { mockData, REDIS_KEY_PREFIX, uuid } from "../utils";
import { pipeline } from "./redis";

export const setMockData = (props?: { range?: number, count?: number, timestampsCount?: number }) => {
  const dataset = mockData(props);

  for (const [path, timestamps] of Object.entries(dataset)) {
    const key = `${REDIS_KEY_PREFIX}:${path}`;
    const args: (string | number)[] = [];

    for (const timestamp of timestamps) {
      args.push(timestamp, `${timestamp}-${uuid()}`);
    }

    pipeline.zadd(key, ...args);
  }

  return pipeline.exec();
}