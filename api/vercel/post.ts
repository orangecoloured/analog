import type { VercelRequest, VercelResponse } from "@vercel/node";
import { pushData } from "../push.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const body = req.body || {};

  if (body.event) {
    try {
      await pushData(body.event);

      return res.status(200);
    } catch (error) {
      res.status(500).setHeader("Content-Type", "text/plain");
  
      return res.send(`Internal Server Error: ${error instanceof Error ? error.message : error}`);
    }
  } else {
    res.status(500).setHeader("Content-Type", "text/plain");
  
    return res.send("Internal Server Error: No `event` found");
  }
};