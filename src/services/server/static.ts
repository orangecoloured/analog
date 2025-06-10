import type { IncomingMessage, ServerResponse } from "http";
import type { UrlWithParsedQuery } from "url";
import { sendError } from "../api";
import { STATIC_DIR, MIME_TYPES } from "./constants";
import path from "path";
import fs from "fs";

export const staticServer = (parsedUrl: UrlWithParsedQuery, res: ServerResponse<IncomingMessage> & { req: IncomingMessage }) => {
  const pathname = parsedUrl.pathname as string;
  const filePath = path.join(STATIC_DIR, pathname === "/" ? "index.html" : pathname);

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(STATIC_DIR, "index.html"), (indexError, indexData) => {
        if (!indexError) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(indexData);
        } else {
          sendError(res, indexError);
        }
      });
    } else {
      const extension = path.extname(filePath) as keyof typeof MIME_TYPES;

      res.writeHead(200, { "Content-Type": MIME_TYPES[extension] || "application/octet-stream" });
      res.end(data);
    }
  });
}
