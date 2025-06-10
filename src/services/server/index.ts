import * as http  from "http";
import * as url from "url";
import { API_ENDPOINT, HEADER_APPLICATION_JSON, HEADER_TEXT_PLAIN, HEADERS_CROSS_ORIGIN, sendError } from "../api";
import { PORT_DEV } from "../../utils";
import { getData, pushData } from "../redis";
import { staticServer } from "./static";

let port = parseInt(process.env.ANALOG_PORT_SERVER as string, 10);

port = isNaN(port) ? PORT_DEV + 1 : port;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url as string, true);

  if ([API_ENDPOINT, `${API_ENDPOINT}/`].includes(parsedUrl.pathname as string)) {
    const token = req.headers.authorization ? req.headers.authorization.replace("Basic ", "") : null;

    switch (req.method) {
      case "GET": {
        if (process.env.ANALOG_TOKEN && token !== process.env.ANALOG_TOKEN) {
          res.writeHead(401, { ...HEADERS_CROSS_ORIGIN, ...HEADER_TEXT_PLAIN });
          res.end("Unauthorized");

          return;
        }

        getData()
          .then(data => {
            res.writeHead(200, { ...HEADERS_CROSS_ORIGIN, ...HEADER_APPLICATION_JSON });
            res.end(JSON.stringify(data));
          })
          .catch(error => {
            sendError(res, error);
          });

        break;
      }

      case "POST": {
        if (process.env.ANALOG_PROTECT_POST === "true" && token !== process.env.ANALOG_TOKEN) {
          res.writeHead(401, { ...HEADERS_CROSS_ORIGIN, ...HEADER_TEXT_PLAIN });
          res.end("Unauthorized");

          return;
        }

        let data = "";

        req.on("data", (chunk: string) => {
          data += chunk;
        });

        req.on("end", () => {
          try {
            const event = JSON.parse(data).event;

            if (event) {
              pushData(event)
                .then(() => {
                  res.writeHead(200, { ...HEADERS_CROSS_ORIGIN, ...HEADER_TEXT_PLAIN });
                  res.end();
                })
                .catch(error => {
                  sendError(res, error);
                });
            } else {
              sendError(res, "No `event` found");
            }
          } catch (error) {
            sendError(res, error);
          }
        });

        break;
      }

      default: {
        res.writeHead(405, { ...HEADERS_CROSS_ORIGIN, ...HEADER_TEXT_PLAIN });
        res.end("Method Not Allowed");
      }
    }

    return;
  }

  if (process.env.ANALOG_STATIC_SERVER === "true") {
    staticServer(parsedUrl, res);

    return;
  }

  res.writeHead(404, { ...HEADERS_CROSS_ORIGIN, ...HEADER_TEXT_PLAIN });
  res.end("Not Found");

  return;
});

server.listen(port, () => {
  console.log(`ANALOG server is running on port ${port}`);
});
