import {
  SQLITE_DATABASE_NAME,
  SQLITE_KEY_EVENT_NAME,
  SQLITE_KEY_TIMESTAMP_NAME,
} from "./constants.js";
import { getSqliteClient } from "./sqlite.js";

export const pushData = async (event: string) => {
  const sqlite = await getSqliteClient();
  const timestamp = Date.now();

  return sqlite.execute({
    sql: `INSERT INTO ${SQLITE_DATABASE_NAME} (${SQLITE_KEY_EVENT_NAME}, ${SQLITE_KEY_TIMESTAMP_NAME}) VALUES (?, ?)`,
    args: [event, timestamp],
  });
};
