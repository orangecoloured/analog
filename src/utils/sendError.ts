import * as http from "http";

export const sendError = (response: http.ServerResponse<http.IncomingMessage>, error: unknown) => {
  response.writeHead(500, { "Content-Type": "text/plain" });
  response.end(`Internal Server Error: ${error instanceof Error ? error.message : error}`);
}