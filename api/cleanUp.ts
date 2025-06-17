import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  HEADER_TEXT_PLAIN_MAP,
  HEADERS_CROSS_ORIGIN_MAP,
} from "../src/services/api/contants.js";
import { databaseAdapter as adapter } from "../src/services/api/databaseAdapter.js";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  await adapter.cleanUpAllData();

  return res
    .status(200)
    .setHeaders(HEADERS_CROSS_ORIGIN_MAP)
    .setHeaders(HEADER_TEXT_PLAIN_MAP);
}
