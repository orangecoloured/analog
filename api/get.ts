import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createRequire } from "node:module";
const getData = createRequire(import.meta.url)("../src/api/get.ts");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const token = req.query.token as string;

  if (process.env.VITE_ANALOG_GET_TOKEN && token !== process.env.VITE_ANALOG_GET_TOKEN) {
    return res.status(200).json({});
  }

  try {
    const data = await getData();

    return res.status(200).json(data);
  } catch (error) {
    res.status(500).setHeader("Content-Type", "text/plain");
  
    return res.send(`Internal Server Error: ${error instanceof Error ? error.message : error}`);
  }
};