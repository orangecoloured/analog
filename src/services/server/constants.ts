import path, { dirname } from "path";
import { fileURLToPath } from "url";

export const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const STATIC_DIR = path.join(__dirname, "dist");
