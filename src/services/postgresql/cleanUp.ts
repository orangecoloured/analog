import type { CleanUpEventRow } from "./types";
import { getCutoff } from "../../utils/getCutoff.js";
import { getRequestItemsCount } from "../../utils/getRequestItemsCount.js";
import {
  POSTGRESQL_DATABASE_NAME,
  POSTGRESQL_KEY_TIMESTAMP_NAME,
} from "./constants.js";
import { postgresql } from "./postgresql.js";

export const cleanUpAllData = async () => {
  const cutoff = getCutoff();

  return await postgresql.query(
    `DELETE FROM ${POSTGRESQL_DATABASE_NAME} WHERE ${POSTGRESQL_KEY_TIMESTAMP_NAME} < $1`,
    [cutoff],
  );
};

export const cleanUpDataByCursor = async (cursor: string = "0") => {
  const requestItemsCount = getRequestItemsCount();
  const cutoff = getCutoff();
  const params = [cutoff];
  let cursorPart = "";

  if (cursor !== "0") {
    cursorPart = `  AND id > $${params.length + 1}`;
    params.push(Number(cursor));
  }

  const query = `WITH to_delete AS (
  SELECT id
  FROM ${POSTGRESQL_DATABASE_NAME}
  WHERE ${POSTGRESQL_KEY_TIMESTAMP_NAME} < $1
${cursorPart}
  ORDER BY id ASC
  LIMIT ${requestItemsCount}
),
deleted AS (
  DELETE FROM ${POSTGRESQL_DATABASE_NAME}
  USING to_delete
  WHERE ${POSTGRESQL_DATABASE_NAME}.id = to_delete.id
  RETURNING to_delete.id
)
SELECT MAX(id)::int AS id
FROM deleted;`;

  const response = await postgresql.query<CleanUpEventRow>(query, params);
  const nextCursor = response.rows.at(-1)?.id || 0;

  return String(nextCursor);
};
