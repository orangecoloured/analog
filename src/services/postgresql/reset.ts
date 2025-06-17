import { POSTGRESQL_DATABASE_NAME } from "./constants.js";
import { postgresql } from "./postgresql.js";

export const resetData = () => {
  return postgresql.query(
    `TRUNCATE TABLE ${POSTGRESQL_DATABASE_NAME} RESTART IDENTITY`,
  );
};
