import {
  MONGODB_KEY_EVENT_NAME,
  MONGODB_KEY_TIMESTAMP_NAME,
} from "./constants.js";
import { mongodbCollection } from "./mongodb.js";

export const pushData = async (event: string) => {
  const mongodb = await mongodbCollection();

  return mongodb.insertOne({
    [MONGODB_KEY_EVENT_NAME]: event,
    [MONGODB_KEY_TIMESTAMP_NAME]: Date.now(),
  });
};
