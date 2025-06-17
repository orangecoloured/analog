/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly ANALOG_TOKEN?: string;
  readonly ANALOG_DATABASE_PROVIDER: "redis" | "postgresql" | "mongodb";
  readonly ANALOG_REDIS_URL?: string;
  readonly ANALOG_POSTGRESQL_URL?: string;
  readonly ANALOG_PROTECT_POST?: "true" | "false";
  readonly ANALOG_SERVE_STATIC?: "true" | "false";
  readonly ANALOG_PORT_SERVER?: string;
  readonly ANALOG_DATABASE_REQUEST_ITEM_COUNT?: string;
  readonly VITE_ANALOG_PAGE_TITLE?: string;
  readonly VITE_ANALOG_TIME_RANGE?: string;
  readonly VITE_ANALOG_API_GET_REQUEST_QUEUE?: "true" | "false";
  readonly VITE_ANALOG_API_GET_REQUEST_CLEAN_UP?: "true" | "false";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
