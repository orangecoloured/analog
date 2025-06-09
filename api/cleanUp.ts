import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HEADER_PLAIN_TEXT_MAP, HEADERS_CROSS_ORIGIN_MAP } from '../src/services/api/contants.js';
import { cleanUpOldData } from "../src/services/redis/cleanUp.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  await cleanUpOldData();

  return res.status(200).setHeaders(HEADERS_CROSS_ORIGIN_MAP).setHeaders(HEADER_PLAIN_TEXT_MAP);
}
