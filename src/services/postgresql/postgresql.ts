import { Pool } from "pg";

export const postgresql = new Pool({
  connectionString: process.env.ANALOG_POSTGRESQL_URL,
});
