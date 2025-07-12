import type { TData } from "../../utils";
import {
  SQLITE_DATABASE_NAME,
  SQLITE_KEY_EVENT_NAME,
  SQLITE_KEY_TIMESTAMP_NAME,
} from "./constants.js";
import { sqlite } from "./sqlite.js";
import { getRequestItemCount } from "../../utils/getRequestItemCount.js";

export const getAllData = async () => {
  const rows = await sqlite.execute({
    sql: `SELECT ${SQLITE_KEY_EVENT_NAME}, ${SQLITE_KEY_TIMESTAMP_NAME} FROM ${SQLITE_DATABASE_NAME}`,
  });

  const data: TData = {};

  for (const row of rows.rows) {
    const event = row[SQLITE_KEY_EVENT_NAME] as string;
    const timestamp = Number(row[SQLITE_KEY_TIMESTAMP_NAME]);

    if (!data[event]) {
      data[event] = [];
    }

    data[event].push(timestamp);
  }

  return data;
};

export const getDataByCursor = async (cursor: string = "0") => {
  const requestItemCount = getRequestItemCount();
  const rows = await sqlite.execute({
    sql: `
      SELECT id, ${SQLITE_KEY_EVENT_NAME}, ${SQLITE_KEY_TIMESTAMP_NAME}
      FROM ${SQLITE_DATABASE_NAME}
      WHERE id > ?
      ORDER BY id ASC
      LIMIT ?
    `,
    args: [cursor, requestItemCount],
  });

  let lastId = Number(cursor);
  const data: TData = {};

  for (const row of rows.rows) {
    const event = row[SQLITE_KEY_EVENT_NAME] as string;
    const timestamp = Number(row[SQLITE_KEY_TIMESTAMP_NAME]);

    if (!data[event]) {
      data[event] = [];
    }

    data[event].push(timestamp);

    lastId = Number(row.id);
  }

  const nextCursor = rows.rows.length === requestItemCount ? lastId : 0;

  return {
    data,
    nextCursor: String(nextCursor),
  };
};
