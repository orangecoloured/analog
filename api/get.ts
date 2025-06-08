import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const redisDir = path.resolve(__dirname, '../src/services/redis');
console.log('Files in redis dir:', fs.readdirSync(redisDir));

import type { VercelRequest, VercelResponse } from "@vercel/node";
//import { getData } from "../src/services/redis/get";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const token = req.query.token as string;

  if (process.env.VITE_ANALOG_GET_TOKEN && token !== process.env.VITE_ANALOG_GET_TOKEN) {
    return res.status(200).json({});
  }

  try {
    //const data = await getData();

    //return res.status(200).json(data);
    return res.status(200).json({});
  } catch (error) {
    res.status(500).setHeader("Content-Type", "text/plain");

    return res.send(`Internal Server Error: ${error instanceof Error ? error.message : error}`);
  }
};
