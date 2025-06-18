import { mongodbCollection } from "./mongodb.js";

export const pushData = async (event: string) => {
  const mongodb = await mongodbCollection();

  return mongodb.insertOne({
    event,
    timestamp: Date.now(),
  });
};
