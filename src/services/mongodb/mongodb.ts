import type { TEventDoc } from "./types";
import { MongoClient, ServerApiVersion } from "mongodb";
import { COLLECTION_NAME, DATABASE_NAME } from "./constants.js";

const client = new MongoClient(process.env.ANALOG_MONGODB_URL as string, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const mongodbCollection = async () => {
  await client.connect();

  return client.db(DATABASE_NAME).collection<TEventDoc>(COLLECTION_NAME);
};
