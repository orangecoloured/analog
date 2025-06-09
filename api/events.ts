import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getData } from "../src/services/redis/get.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!["GET", "POST", "OPTIONS"].includes(req.method as string)) {
    return {
      statusCode: 405,
      // headers: {
      //   ...responseAccessHeaders(),
      // },
      body: "Method Not Allowed",
    }
  }
  console.log('REQ', req.method, req.headers, req.rawHeaders, req.url);
  const token = req.query.token as string;

  if (process.env.VITE_ANALOG_GET_TOKEN && token !== process.env.VITE_ANALOG_GET_TOKEN) {
    return res.status(200).json({});
  }

  try {
    const data = await getData();

    return res.status(200).json(data);
    //return res.status(200).json({});
  } catch (error) {
    res.status(500).setHeader("Content-Type", "text/plain");

    return res.send(`Internal Server Error: ${error instanceof Error ? error.message : error}`);
  }
};
