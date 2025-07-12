import { createClient, type Client } from "@libsql/client";
import { extractAuthTokenFromUrl } from "../../utils/extractAuthTokenFromUrl.js";
import {
  SQLITE_DATABASE_NAME,
  SQLITE_KEY_EVENT_NAME,
  SQLITE_KEY_TIMESTAMP_NAME,
} from "./constants.js";

const initSchema = async () => {
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${SQLITE_DATABASE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ${SQLITE_KEY_EVENT_NAME} TEXT NOT NULL,
      ${SQLITE_KEY_TIMESTAMP_NAME} INTEGER NOT NULL
    );
  `);

  await sqlite.execute(
    `CREATE INDEX IF NOT EXISTS idx_${SQLITE_KEY_EVENT_NAME} ON ${SQLITE_DATABASE_NAME}(${SQLITE_KEY_EVENT_NAME});`,
  );
  await sqlite.execute(
    `CREATE INDEX IF NOT EXISTS idx_${SQLITE_KEY_TIMESTAMP_NAME} ON ${SQLITE_DATABASE_NAME}(${SQLITE_KEY_TIMESTAMP_NAME});`,
  );
};

const connectionString = process.env.ANALOG_SQLITE_URL as string;

export let sqlite: Client;

if (connectionString) {
  const { url, authToken } = extractAuthTokenFromUrl(connectionString);

  sqlite = createClient({
    url,
    ...(authToken ? { authToken } : null),
  });

  initSchema();
}
