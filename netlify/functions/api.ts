import type { Handler } from "@netlify/functions";
import { API_ENDPOINT, responseAccessHeaders } from "../../src/utils";
import { getData } from "../../src/api/get";
import { pushData } from "../../src/api/push";

export const handler: Handler = async (event) => {
  if (!["GET", "POST", "OPTIONS"].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: {
        ...responseAccessHeaders(),
      },
      body: "Method Not Allowed",
    }
  }

  if (![API_ENDPOINT, `${API_ENDPOINT}/`].includes(event.path as string)) {
    console.log('PATH?', event.path, event.route);
    return {
      statusCode: 404,
      headers: {
        ...responseAccessHeaders(),
      },
      body: "Not Found",
    };
  }

  const token = event.headers["authorization"] ? event.headers["authorization"].replace("Basic ", "") : null;

  switch (event.httpMethod) {
    default:
    case "OPTIONS": {
      return {
        statusCode: 200,
        headers: {
          ...responseAccessHeaders(),
        },
      };
    }

    case "GET": {
      if (process.env.ANALOG_TOKEN && token !== process.env.ANALOG_TOKEN) {
        return {
          statusCode: 401,
          headers: {
            ...responseAccessHeaders(),
          },
        }
      }

      try {
        const data = await getData();

        return {
          statusCode: 200,
          headers: {
            ...responseAccessHeaders(),
          },
          body: JSON.stringify(data),
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers: {
            ...responseAccessHeaders(),
          },
          body: `Internal Server Error: ${error instanceof Error ? error.message : error}`,
        }
      }
    }

    case "POST" : {
      if (process.env.ANALOG_PROTECT_POST && token !== process.env.ANALOG_TOKEN) {
        return {
          statusCode: 401,
          headers: {
            ...responseAccessHeaders(),
          },
        }
      }

      const body = JSON.parse(event.body || "{}");

      if (body.event) {
        try {
          await pushData(body.event);

          return {
            statusCode: 200,
            headers: {
              ...responseAccessHeaders(),
            },
          }
        } catch (error) {
          return {
            statusCode: 500,
            headers: {
              ...responseAccessHeaders(),
            },
            body: `Internal Server Error: ${error instanceof Error ? error.message : error}`,
          }
        }
      } else {
        return {
          statusCode: 500,
          headers: {
              ...responseAccessHeaders(),
            },
          body: "Internal Server Error: No `event` found",
        }
      }
    }
  }
};
