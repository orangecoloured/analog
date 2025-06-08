import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cleanUpOldData } from "../src/services/redis/cleanUp";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  await cleanUpOldData();

  return res.status(200);
}
