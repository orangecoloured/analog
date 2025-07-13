import type { TEventDoc, TPaginatedQuery } from "./types";
import { getCutoff } from "../../utils/getCutoff.js";
import { mongodbCollection } from "./mongodb.js";
import { getRequestItemCount } from "../../utils/getRequestItemCount.js";
import { MONGODB_KEY_TIMESTAMP_NAME } from "./constants.js";
import type { ObjectId } from "mongodb";

export const cleanUpAllData = async () => {
  const cutoff = getCutoff();
  const mongodb = await mongodbCollection();

  return await mongodb.deleteMany({
    [MONGODB_KEY_TIMESTAMP_NAME]: { $lt: cutoff },
  });
};

export const cleanUpDataByCursor = async (cursorString: string = "0") => {
  const mongodb = await mongodbCollection();
  const cursor = Number(cursorString);
  const cutoff = getCutoff();
  const requestItemCount = getRequestItemCount();
  const query: TPaginatedQuery = {
    [MONGODB_KEY_TIMESTAMP_NAME]: { $lt: cutoff },
  };

  if (cursor !== 0) {
    query[MONGODB_KEY_TIMESTAMP_NAME].$gt = cursor;
  }

  const docs = await mongodb
    .find<TEventDoc>(query)
    .sort({ [MONGODB_KEY_TIMESTAMP_NAME]: 1 })
    .limit(requestItemCount)
    .toArray();

  if (docs.length === 0) {
    return String(0);
  }

  const idsToDelete = docs.map((doc) => doc._id as ObjectId);

  await mongodb.deleteMany({ _id: { $in: idsToDelete } });

  const nextCursor =
    docs.length < requestItemCount
      ? 0
      : docs.at(-1)?.[MONGODB_KEY_TIMESTAMP_NAME] || 0;

  return nextCursor;
};
