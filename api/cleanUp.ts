import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  HEADER_TEXT_PLAIN_MAP,
  HEADERS_CROSS_ORIGIN_MAP,
} from "../src/services/api/contants.js";
import { cleanUpAllData } from "../src/services/redis/cleanUp.js";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
) {
  await cleanUpAllData();

  return res
    .status(200)
    .setHeaders(HEADERS_CROSS_ORIGIN_MAP)
    .setHeaders(HEADER_TEXT_PLAIN_MAP);
}
