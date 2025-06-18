import { mongodb } from "./mongodb.js";

export const pushData = (event: string) => {
  return mongodb.insertOne({
    event,
    timestamp: Date.now(),
  });
};
