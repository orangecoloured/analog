import type { Client } from "@libsql/client";
import { extractAuthTokenFromUrl } from "../../utils/extractAuthTokenFromUrl.js";
import {
  SQLITE_DATABASE_NAME,
  SQLITE_KEY_EVENT_NAME,
  SQLITE_KEY_TIMESTAMP_NAME,
} from "./constants.js";

let sqliteClient: Client | null = null;

const createSqliteClient = async (): Promise<Client> => {
  const connectionString = process.env.ANALOG_SQLITE_URL as string;
  if (!connectionString) {
    throw new Error("ANALOG_SQLITE_URL is not set");
  }

  const { url, authToken } = extractAuthTokenFromUrl(connectionString);
  const isFileUrl = url.startsWith("file:");

  let createClient: (config: { url: string; authToken?: string }) => Client;

  if (isFileUrl) {
    const libsql = await import("@libsql/client");
    createClient = libsql.createClient;
  } else {
    const libsqlWeb = await import("@libsql/client/web");
    createClient = libsqlWeb.createClient;
  }

  const client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS ${SQLITE_DATABASE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ${SQLITE_KEY_EVENT_NAME} TEXT NOT NULL,
      ${SQLITE_KEY_TIMESTAMP_NAME} INTEGER NOT NULL
    );
  `);

  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_${SQLITE_KEY_EVENT_NAME} ON ${SQLITE_DATABASE_NAME}(${SQLITE_KEY_EVENT_NAME});`,
  );
  await client.execute(
    `CREATE INDEX IF NOT EXISTS idx_${SQLITE_KEY_TIMESTAMP_NAME} ON ${SQLITE_DATABASE_NAME}(${SQLITE_KEY_TIMESTAMP_NAME});`,
  );

  return client;
};

export const getSqliteClient = async (): Promise<Client> => {
  if (!sqliteClient) {
    sqliteClient = await createSqliteClient();
  }
  return sqliteClient;
};
