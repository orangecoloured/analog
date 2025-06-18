import type { TEventDoc, TPaginatedQuery } from "./types";
import { getCutoff } from "../../utils/getCutoff.js";
import { mongodbCollection } from "./mongodb.js";
import { getRequestItemCount } from "../../utils/getRequestItemCount.js";

export const cleanUpAllData = async () => {
  const cutoff = getCutoff();
  const mongodb = await mongodbCollection();

  return await mongodb.deleteMany({ timestamp: { $lt: cutoff } });
};

export const cleanUpDataByCursor = async (cursorString: string = "0") => {
  const mongodb = await mongodbCollection();
  const cursor = Number(cursorString);
  const cutoff = getCutoff();
  const requestItemCount = getRequestItemCount();
  const query: TPaginatedQuery = { timestamp: { $lt: cutoff } };

  if (cursor !== 0) {
    query.timestamp.$gt = cursor;
  }

  const docs = await mongodb
    .find<TEventDoc>(query)
    .sort({ timestamp: 1 })
    .limit(requestItemCount)
    .toArray();

  if (docs.length === 0) {
    return String(0);
  }

  const idsToDelete = docs.map((doc) => doc._id);

  await mongodb.deleteMany({ _id: { $in: idsToDelete } });

  const nextCursor =
    docs.length < requestItemCount ? 0 : docs.at(-1)?.timestamp || 0;

  return nextCursor;
};
