import {
  SQLITE_DATABASE_NAME,
  SQLITE_KEY_EVENT_NAME,
  SQLITE_KEY_TIMESTAMP_NAME,
} from "./constants.js";
import { sqlite } from "./sqlite.js";

export const pushData = (event: string) => {
  const timestamp = Date.now();

  return sqlite.execute({
    sql: `INSERT INTO ${SQLITE_DATABASE_NAME} (${SQLITE_KEY_EVENT_NAME}, ${SQLITE_KEY_TIMESTAMP_NAME}) VALUES (?, ?)`,
    args: [event, timestamp],
  });
};
