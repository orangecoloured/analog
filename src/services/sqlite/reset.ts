import { SQLITE_DATABASE_NAME } from "./constants.js";
import { sqlite } from "./sqlite.js";

export const resetData = () => {
  return sqlite.execute(`DELETE FROM ${SQLITE_DATABASE_NAME}`);
};
