import * as http  from "http";
import { getData } from "./get";
import { pushData } from "./push";
import * as url from "url";
import { PORT_DEV, sendError } from "../src/utils";

let port = parseInt(process.env.VITE_ANALOG_PORT_DEV as string, 10);

port = isNaN(port) ? PORT_DEV + 1 : port + 1;

const server = http.createServer((req, res) => {
  switch (req.method) {
    case "GET": {
      const parsedUrl = url.parse(req.url || "", true);

      if (process.env.VITE_ANALOG_GET_TOKEN && parsedUrl.query.token !== process.env.VITE_ANALOG_GET_TOKEN) {
        res.writeHead(200, { "Content-Type": "applications/json" });
        res.end("{}");

        return;
      }

      getData()
        .then(data => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(data));
        })
        .catch(error => {
          sendError(res, error);
        });

      break;
    }

    case "POST": {
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
                res.writeHead(200);
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
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");

      break;
    }
  }
});

server.listen(port, () => {
  console.log(`ANALOG dev server is running on http://localhost:${port}`);
});