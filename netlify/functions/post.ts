import type { Handler } from "@netlify/functions";
import { pushData } from "../../api/push";

export const handler: Handler = async (event) => {
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
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: `Internal Server Error: ${error instanceof Error ? error.message : error}`,
      }
    }
  } else {
    return {
      statusCode: 500,
      body: "Internal Server Error: No `event` found",
    }
  }
};