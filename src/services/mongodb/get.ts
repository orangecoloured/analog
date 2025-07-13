import type { TData } from "../../utils";
import type { TEventDoc, TPaginatedQuery } from "./types";
import { getCutoff } from "../../utils/getCutoff.js";
import { getRequestItemCount } from "../../utils/getRequestItemCount.js";
import { mongodbCollection } from "./mongodb.js";
import {
  MONGODB_KEY_EVENT_NAME,
  MONGODB_KEY_TIMESTAMP_NAME,
} from "./constants.js";

export const getAllData = async () => {
  const mongodb = await mongodbCollection();
  const cutoff = getCutoff();
  const query = { [MONGODB_KEY_TIMESTAMP_NAME]: { $gte: cutoff } };

  const docs = await mongodb
    .find(query)
    .sort({ [MONGODB_KEY_TIMESTAMP_NAME]: 1 })
    .toArray();
  const data: TData = {};

  for (const doc of docs) {
    if (!data[doc[MONGODB_KEY_EVENT_NAME]]) {
      data[doc[MONGODB_KEY_EVENT_NAME]] = [];
    }

    data[doc[MONGODB_KEY_EVENT_NAME]].push(doc[MONGODB_KEY_TIMESTAMP_NAME]);
  }

  return data;
};

export const getDataByCursor = async (cursorString: string = "0") => {
  const mongodb = await mongodbCollection();
  const cutoff = getCutoff();
  const requestItemCount = getRequestItemCount();
  const cursor = Number(cursorString);
  const query: TPaginatedQuery = {
    [MONGODB_KEY_TIMESTAMP_NAME]: { $gte: cutoff },
  };

  if (cursor !== 0) {
    query[MONGODB_KEY_TIMESTAMP_NAME].$gt = cursor;
  }

  const cursorQuery = mongodb
    .find<TEventDoc>(query)
    .sort({ [MONGODB_KEY_TIMESTAMP_NAME]: 1 })
    .limit(requestItemCount);
  const docs = await cursorQuery.toArray();
  const data: TData = {};

  for (const doc of docs) {
    if (!data[doc[MONGODB_KEY_EVENT_NAME]]) {
      data[doc[MONGODB_KEY_EVENT_NAME]] = [];
    }

    data[doc[MONGODB_KEY_EVENT_NAME]].push(doc[MONGODB_KEY_TIMESTAMP_NAME]);
  }

  const nextCursor =
    docs.length < requestItemCount
      ? 0
      : docs.at(-1)?.[MONGODB_KEY_TIMESTAMP_NAME] || 0;

  return {
    data,
    nextCursor: String(nextCursor),
  };
};
