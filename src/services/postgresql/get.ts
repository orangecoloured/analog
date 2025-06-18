import type { TData, TPaginatedData } from "../../utils";
import type { TEventRow } from "./types";
import { getRequestItemCount } from "../../utils/getRequestItemCount.js";
import { getCutoff } from "../../utils/getCutoff.js";
import { GET_QUERY } from "./constants.js";
import { postgresql } from "./postgresql.js";

const mergeRowsToObject = (rows: TEventRow[]) => {
  const data: TData = {};

  rows.forEach((row) => {
    if (!data[row.event]) {
      data[row.event] = [];
    }

    data[row.event].push(Number(row.timestamp));
  });

  return data;
};

export const getAllData = async () => {
  const cutoff = getCutoff();
  const params = [cutoff];
  const response = await postgresql.query<TEventRow>(GET_QUERY, params);
  const data = mergeRowsToObject(response.rows);

  return data;
};

export const getDataByCursor = async (
  cursor: string = "0",
): Promise<TPaginatedData> => {
  const requestItemCount = getRequestItemCount();
  const cutoff = getCutoff();
  const params = [cutoff];
  let query = GET_QUERY.replace("SELECT", "SELECT id,");

  if (cursor !== "0") {
    query += ` AND id > $${params.length + 1}`;
    params.push(Number(cursor));
  }

  query += " ORDER BY id ASC";

  query += ` LIMIT $${params.length + 1}`;
  params.push(requestItemCount);

  const response = await postgresql.query<TEventRow>(query, params);
  const data = mergeRowsToObject(response.rows);
  const nextCursor = response.rows.at(-1)?.id || 0;

  return {
    data,
    nextCursor: String(nextCursor),
  };
};
