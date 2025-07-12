import { getCutoff } from "../../utils/getCutoff.js";
import { getRequestItemCount } from "../../utils/getRequestItemCount.js";
import {
  SQLITE_DATABASE_NAME,
  SQLITE_KEY_TIMESTAMP_NAME,
} from "./constants.js";
import { sqlite } from "./sqlite.js";

export const cleanUpAllData = async (): Promise<"OK"> => {
  const cutoff = getCutoff();

  await sqlite.execute({
    sql: `DELETE FROM ${SQLITE_DATABASE_NAME} WHERE ${SQLITE_KEY_TIMESTAMP_NAME} < ?`,
    args: [cutoff],
  });

  return "OK";
};

export const cleanUpDataByCursor = async (cursor: string = "0") => {
  const cutoff = getCutoff();
  const requestItemCount = getRequestItemCount();
  const response = await sqlite.execute({
    sql: `
      SELECT id FROM ${SQLITE_DATABASE_NAME}
      WHERE ${SQLITE_KEY_TIMESTAMP_NAME} < ? AND id > ?
      ORDER BY id ASC
      LIMIT ?
    `,
    args: [cutoff, cursor, requestItemCount],
  });

  const ids = response.rows.map((row) => row.id);

  if (ids.length === 0) {
    return "0";
  }

  const placeholders = ids.map(() => "?").join(",");

  await sqlite.execute({
    sql: `DELETE FROM ${SQLITE_DATABASE_NAME} WHERE id IN (${placeholders})`,
    args: ids,
  });

  const nextCursor =
    ids.length === requestItemCount ? Number(ids[ids.length - 1]) : 0;

  return String(nextCursor);
};
