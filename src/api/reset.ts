import { redis } from "./redis";

const resetData = () => {
  return redis.flushdb();
}

export default resetData;