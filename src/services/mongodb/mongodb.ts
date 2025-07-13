import type { TEventDoc } from "./types";
import { Collection, MongoClient, ServerApiVersion } from "mongodb";
import { MONGODB_COLLECTION_NAME, MONGODB_DATABASE_NAME } from "./constants.js";

const connectionString = process.env.ANALOG_MONGODB_URL as string;

export let client: MongoClient;
export let mongodbCollection: () => Promise<Collection<TEventDoc>>;

if (connectionString) {
  client = new MongoClient(connectionString, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  mongodbCollection = async () => {
    await client.connect();

    return client
      .db(MONGODB_DATABASE_NAME)
      .collection<TEventDoc>(MONGODB_COLLECTION_NAME);
  };
}
