export const API_ENDPOINT = "/api/events";

export const HEADERS_CROSS_ORIGIN = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS, GET, POST",
};
export const HEADERS_CROSS_ORIGIN_MAP = new Map(Object.entries(HEADERS_CROSS_ORIGIN));

export const HEADER_PLAIN_TEXT = {
  "Content-Type": "text/plain",
}
export const HEADER_PLAIN_TEXT_MAP = new Map(Object.entries(HEADER_PLAIN_TEXT));

export const HEADER_APPLICATION_JSON = {
  "Content-Type": "application/json",
}
export const HEADER_APPLICATION_JSON_MAP = new Map(Object.entries(HEADER_APPLICATION_JSON));
