import type { Handler } from "@netlify/functions";
import pushData from "../../src/api/push";
import { responseAccessHeaders } from "../../src/utils";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        ...responseAccessHeaders("POST"),
      },
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    }
  }

  const body = JSON.parse(event.body || '{}');

  if (body.event) {
    try {
      await pushData(body.event);

      return {
        statusCode: 200,
        headers: {
          ...responseAccessHeaders("POST"),
        },
      }
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          ...responseAccessHeaders("POST"),
        },
        body: `Internal Server Error: ${error instanceof Error ? error.message : error}`,
      }
    }
  } else {
    return {
      statusCode: 500,
      headers: {
          ...responseAccessHeaders("POST"),
        },
      body: "Internal Server Error: No `event` found",
    }
  }
};