import { Handler } from "@netlify/functions";
import { pushData } from "../../src/api/push";

export const handler: Handler = async (event) => {
  const body = JSON.parse(event.body || '{}');

  if (body.path) {
    try {
      await pushData(body.path);

      return {
        statusCode: 200,
        body: "",
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
      body: "Internal Server Error: No `path` found",
    }
  }
};