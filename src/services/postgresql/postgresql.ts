import { Pool } from "pg";
import {
  POSTGRESQL_DATABASE_NAME,
  POSTGRESQL_KEY_EVENT_NAME,
  POSTGRESQL_KEY_TIMESTAMP_NAME,
} from "./constants.js";

export async function initSchema() {
  await postgresql.query(`
    CREATE TABLE IF NOT EXISTS ${POSTGRESQL_DATABASE_NAME} (
      id SERIAL PRIMARY KEY,
      ${POSTGRESQL_KEY_EVENT_NAME} TEXT NOT NULL,
      ${POSTGRESQL_KEY_TIMESTAMP_NAME} BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
    );
  `);

  await postgresql.query(
    `CREATE INDEX IF NOT EXISTS index_${POSTGRESQL_DATABASE_NAME}_${POSTGRESQL_KEY_EVENT_NAME}_${POSTGRESQL_KEY_TIMESTAMP_NAME} ON ${POSTGRESQL_DATABASE_NAME}(${POSTGRESQL_KEY_EVENT_NAME}, ${POSTGRESQL_KEY_TIMESTAMP_NAME});`,
  );
}

const connectionString = process.env.ANALOG_POSTGRESQL_URL as string;

export let postgresql: Pool;

if (connectionString) {
  postgresql = new Pool({
    connectionString,
  });

  initSchema();
}
