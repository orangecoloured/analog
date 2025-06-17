import type { TData, TPaginatedData } from "../../utils";
import type { EventRow } from "./types";
import { getRequestItemsCount } from "../../utils/getRequestItemsCount.js";
import { getCutoff } from "../../utils/getCutoff.js";
import { GET_QUERY } from "./constants.js";
import { postgresql } from "./postgresql.js";

const mergeRowsToObject = (rows: EventRow[]) => {
  const data: TData = {};

  rows.forEach((row) => {
    if (!data[row.event_name]) {
      data[row.event_name] = [];
    }

    data[row.event_name].push(Number(row.timestamp));
  });

  return data;
};

export const getAllData = async () => {
  const cutoff = getCutoff();
  const params = [cutoff];
  const response = await postgresql.query<EventRow>(GET_QUERY, params);
  const data = mergeRowsToObject(response.rows);

  return data;
};

export const getDataByCursor = async (
  cursor: string = "null",
): Promise<TPaginatedData> => {
  const requestItemsCount = getRequestItemsCount();
  const cutoff = getCutoff();
  const params = [cutoff];
  let query = GET_QUERY.replace("SELECT", "SELECT id,");

  if (cursor !== "null") {
    query += ` AND id > $${params.length + 1}`;
    params.push(Number(cursor));
  }

  query += " ORDER BY id ASC";

  if (cursor !== null) {
    query += ` LIMIT $${params.length + 1}`;
    params.push(requestItemsCount);
  }

  const response = await postgresql.query<EventRow>(query, params);
  const data = mergeRowsToObject(response.rows);
  const nextCursor = response.rows.at(-1)?.id || null;

  return {
    data,
    nextCursor: String(nextCursor),
  };
};
