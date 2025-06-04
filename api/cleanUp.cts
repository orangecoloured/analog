import type { VercelRequest, VercelResponse } from '@vercel/node';
const { cleanUpOldData } = require('../src/api/cleanUp');

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  await cleanUpOldData();

  return res.status(200);
}