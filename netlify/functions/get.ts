import { Handler } from "@netlify/functions";
import { getData } from "../../src/api/get";

export const handler: Handler = async (event) => {
  const searchParams = new URLSearchParams(event.queryStringParameters as Record<string, string> || {});

  if (process.env.VITE_ANALOG_GET_TOKEN && searchParams.get("token") !== process.env.VITE_ANALOG_GET_TOKEN) {
    return {
      statusCode: 200,
      body: "{}",
    }
  }

  try {
    const data = await getData();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error instanceof Error ? error.message : error}`,
    }
  }
};