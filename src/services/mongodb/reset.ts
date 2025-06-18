import { mongodbCollection } from "./mongodb.js";

export const resetData = async () => {
  const mongodb = await mongodbCollection();

  return mongodb.drop();
};
