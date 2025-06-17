import type { Handler } from "@netlify/functions";
import {
  HEADER_TEXT_PLAIN,
  HEADERS_CROSS_ORIGIN,
  databaseAdapter,
} from "../../src/services/api";

export const handler: Handler = async () => {
  await databaseAdapter.cleanUpAllData();

  return {
    statusCode: 200,
    headers: {
      ...HEADERS_CROSS_ORIGIN,
      ...HEADER_TEXT_PLAIN,
    },
  };
};
