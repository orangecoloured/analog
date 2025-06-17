import type { Handler } from "@netlify/functions";
import {
  API_ENDPOINT,
  HEADERS_CROSS_ORIGIN,
  HEADER_APPLICATION_JSON,
  HEADER_TEXT_PLAIN,
  databaseAdapter as adapter,
} from "../../src/services/api";

export const handler: Handler = async (event) => {
  if (!["GET", "POST", "OPTIONS"].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: {
        ...HEADERS_CROSS_ORIGIN,
        ...HEADER_TEXT_PLAIN,
      },
      body: "Method Not Allowed",
    };
  }

  if (![API_ENDPOINT, `${API_ENDPOINT}/`].includes(event.path as string)) {
    return {
      statusCode: 404,
      headers: {
        ...HEADERS_CROSS_ORIGIN,
        ...HEADER_TEXT_PLAIN,
      },
      body: "Not Found",
    };
  }

  const token = event.headers.authorization
    ? event.headers.authorization.replace("Basic ", "")
    : null;

  switch (event.httpMethod) {
    default:
    case "OPTIONS": {
      return {
        statusCode: 200,
        headers: {
          ...HEADERS_CROSS_ORIGIN,
          ...HEADER_TEXT_PLAIN,
        },
      };
    }

    case "GET": {
      if (process.env.ANALOG_TOKEN && token !== process.env.ANALOG_TOKEN) {
        return {
          statusCode: 401,
          headers: {
            ...HEADERS_CROSS_ORIGIN,
            ...HEADER_TEXT_PLAIN,
          },
          body: "Unauthorized",
        };
      }

      try {
        const cursor = event.queryStringParameters?.cursor;
        const cleanUp = event.queryStringParameters?.["clean-up"];

        let data;

        if (cursor) {
          data = await adapter.getDataByCursor(cursor);
        } else {
          data = await adapter.getAllData();
        }

        if (cleanUp) {
          if (cursor) {
            await adapter.cleanUpDataByCursor(cursor);
          } else {
            await adapter.cleanUpAllData();
          }
        }

        return {
          statusCode: 200,
          headers: {
            ...HEADERS_CROSS_ORIGIN,
            ...HEADER_APPLICATION_JSON,
          },
          body: JSON.stringify(data),
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers: {
            ...HEADERS_CROSS_ORIGIN,
            ...HEADER_TEXT_PLAIN,
          },
          body: `Internal Server Error: ${error instanceof Error ? error.message : error}`,
        };
      }
    }

    case "POST": {
      if (
        process.env.ANALOG_PROTECT_POST === "true" &&
        token !== process.env.ANALOG_TOKEN
      ) {
        return {
          statusCode: 401,
          headers: {
            ...HEADERS_CROSS_ORIGIN,
            ...HEADER_TEXT_PLAIN,
          },
          body: "Unauthorized",
        };
      }

      const body = JSON.parse(event.body || "{}");

      if (body.event) {
        try {
          await adapter.pushData(body.event);

          return {
            statusCode: 200,
            headers: {
              ...HEADERS_CROSS_ORIGIN,
              ...HEADER_TEXT_PLAIN,
            },
          };
        } catch (error) {
          return {
            statusCode: 500,
            headers: {
              ...HEADERS_CROSS_ORIGIN,
              ...HEADER_TEXT_PLAIN,
            },
            body: `Internal Server Error: ${error instanceof Error ? error.message : error}`,
          };
        }
      } else {
        return {
          statusCode: 500,
          headers: {
            ...HEADERS_CROSS_ORIGIN,
            ...HEADER_TEXT_PLAIN,
          },
          body: "Internal Server Error: No `event` found",
        };
      }
    }
  }
};
