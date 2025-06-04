import { mockData, REDIS_KEY_PREFIX, uuid } from "../utils";
import { pipeline } from "./redis";

const setMockData = (props?: { range?: number, count?: number, timestampsCount?: number }) => {
  const dataset = mockData(props);

  for (const [event, timestamps] of Object.entries(dataset)) {
    const key = `${REDIS_KEY_PREFIX}:${event}`;
    const args: (string | number)[] = [];

    for (const timestamp of timestamps) {
      args.push(timestamp, `${timestamp}-${uuid()}`);
    }

    pipeline.zadd(key, ...args);
  }

  return pipeline.exec();
}

export default setMockData;