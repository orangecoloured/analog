import type { VercelRequest, VercelResponse } from "@vercel/node";
import { API_ENDPOINT, HEADER_APPLICATION_JSON_MAP, HEADER_PLAIN_TEXT_MAP, HEADERS_CROSS_ORIGIN_MAP } from "../src/services/api/contants.js";
import { getData } from "../src/services/redis/get.js";
import { pushData } from "../src/services/redis/push.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!["GET", "POST", "OPTIONS"].includes(req.method as string)) {
    res.status(405).setHeaders(HEADERS_CROSS_ORIGIN_MAP).setHeaders(HEADER_PLAIN_TEXT_MAP);

    return res.send("Method Not Allowed");
  }

  if (![API_ENDPOINT, `${API_ENDPOINT}/`].includes(req.url as string)) {
    res.status(404).setHeaders(HEADERS_CROSS_ORIGIN_MAP).setHeaders(HEADER_PLAIN_TEXT_MAP);

    return res.send("Not Found");
  }

  const token = req.headers.authorization ? req.headers.authorization.replace("Basic ", "") : null;

  switch (req.method) {
    default:
    case "OPTIONS": {
      res.status(200).setHeaders(HEADERS_CROSS_ORIGIN_MAP).setHeaders(HEADER_PLAIN_TEXT_MAP);

      return res.send("");
    }

    case "GET": {
      if (process.env.ANALOG_TOKEN && token !== process.env.ANALOG_TOKEN) {
        res.status(401).setHeaders(HEADERS_CROSS_ORIGIN_MAP).setHeaders(HEADER_PLAIN_TEXT_MAP);

        return res.send("Unauthorized");
      }

      try {
        const data = await getData();

        res.status(200).setHeaders(HEADERS_CROSS_ORIGIN_MAP).setHeaders(HEADER_APPLICATION_JSON_MAP);

        return res.send(JSON.stringify(data));
      } catch (error) {
        res.status(500).setHeaders(HEADERS_CROSS_ORIGIN_MAP).setHeaders(HEADER_PLAIN_TEXT_MAP);

        return res.send(`Internal Server Error: ${error instanceof Error ? error.message : error}`);
      }
    }

    case "POST": {
      const body = req.body || {};

      if (body.event) {
        try {
          await pushData(body.event);

          res.status(200).setHeaders(HEADER_PLAIN_TEXT_MAP);

          return res.send("");
        } catch (error) {
          res.status(500).setHeaders(HEADER_PLAIN_TEXT_MAP);

          return res.send(`Internal Server Error: ${error instanceof Error ? error.message : error}`);
        }
      } else {
        res.status(500).setHeaders(HEADER_PLAIN_TEXT_MAP);

        return res.send("Internal Server Error: No `event` found");
      }
    }
  }
};
