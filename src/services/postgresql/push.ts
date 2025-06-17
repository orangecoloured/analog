import {
  POSTGRESQL_DATABASE_NAME,
  POSTGRESQL_KEY_EVENT_NAME,
  POSTGRESQL_KEY_TIMESTAMP_NAME,
} from "./constants.js";
import { postgresql } from "./postgresql.js";

export const pushData = (event: string) => {
  const timestamp = Date.now();

  return postgresql.query(
    `INSERT INTO ${POSTGRESQL_DATABASE_NAME} (${POSTGRESQL_KEY_EVENT_NAME}, ${POSTGRESQL_KEY_TIMESTAMP_NAME}) VALUES ($1, $2)`,
    [event, timestamp],
  );
};
