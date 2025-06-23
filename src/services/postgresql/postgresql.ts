import { Pool } from "pg";

const connectionString = process.env.ANALOG_POSTGRESQL_URL as string;

export let postgresql: Pool;

if (connectionString) {
  postgresql = new Pool({
    connectionString,
  });
}
