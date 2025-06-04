import { VercelRequest, VercelResponse } from '@vercel/node';
import { cleanUpOldData } from "../src/api/cleanUp";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  await cleanUpOldData();

  return res.status(200);
}