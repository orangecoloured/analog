import { TIME_RANGE_MAX } from "./constants.js";

export const getCutoff = () => {
  let offset = Number(process.env.VITE_ANALOG_TIME_RANGE as string);

  if (isNaN(offset)) {
    offset = TIME_RANGE_MAX;
  }

  const cutoff = Date.now() - (offset + 1) * 24 * 60 * 60 * 1000;

  return cutoff;
};
