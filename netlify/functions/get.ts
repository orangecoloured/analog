import type { Handler } from "@netlify/functions";
import getData from "../../src/api/get";
import { responseAccessHeaders } from "../../src/utils";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        ...responseAccessHeaders("GET"),
      },
    };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    }
  }

  const searchParams = new URLSearchParams(event.queryStringParameters as Record<string, string> || {});

  if (process.env.VITE_ANALOG_GET_TOKEN && searchParams.get("token") !== process.env.VITE_ANALOG_GET_TOKEN) {
    return {
      statusCode: 200,
      headers: {
        ...responseAccessHeaders("GET"),
      },
      body: "{}",
    }
  }

  try {
    const data = await getData();

    return {
      statusCode: 200,
      headers: {
        ...responseAccessHeaders("GET"),
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        ...responseAccessHeaders("GET"),
      },
      body: `Internal Server Error: ${error instanceof Error ? error.message : error}`,
    }
  }
};