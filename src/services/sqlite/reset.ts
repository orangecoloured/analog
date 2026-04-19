import { SQLITE_DATABASE_NAME } from "./constants.js";
import { getSqliteClient } from "./sqlite.js";

export const resetData = async () => {
  const sqlite = await getSqliteClient();
  return sqlite.execute(`DELETE FROM ${SQLITE_DATABASE_NAME}`);
};
