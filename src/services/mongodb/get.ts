import type { TData } from "../../utils";
import type { TEventDoc, TPaginatedQuery } from "./types";
import { getCutoff } from "../../utils/getCutoff.js";
import { getRequestItemCount } from "../../utils/getRequestItemCount.js";
import { mongodbCollection } from "./mongodb.js";

export const getAllData = async () => {
  const mongodb = await mongodbCollection();
  const cutoff = getCutoff();
  const query = { timestamp: { $gte: cutoff } };

  const docs = await mongodb.find(query).sort({ timestamp: 1 }).toArray();
  const data: TData = {};

  for (const doc of docs) {
    if (!data[doc.event]) {
      data[doc.event] = [];
    }

    data[doc.event].push(doc.timestamp);
  }

  return data;
};

export const getDataByCursor = async (cursorString: string = "0") => {
  const mongodb = await mongodbCollection();
  const cutoff = getCutoff();
  const requestItemCount = getRequestItemCount();
  const cursor = Number(cursorString);
  const query: TPaginatedQuery = { timestamp: { $gte: cutoff } };

  if (cursor !== 0) {
    query.timestamp.$gt = cursor;
  }

  const cursorQuery = mongodb
    .find<TEventDoc>(query)
    .sort({ timestamp: 1 })
    .limit(requestItemCount);
  const docs = await cursorQuery.toArray();
  const data: TData = {};

  for (const doc of docs) {
    if (!data[doc.event]) {
      data[doc.event] = [];
    }

    data[doc.event].push(doc.timestamp);
  }

  const nextCursor =
    docs.length < requestItemCount ? 0 : docs.at(-1)?.timestamp || 0;

  return {
    data,
    nextCursor: String(nextCursor),
  };
};
