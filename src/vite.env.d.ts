/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly ANALOG_TOKEN?: string;
  readonly ANALOG_REDIS_URL: string;
  readonly ANALOG_PROTECT_POST?: "true" | "false";
  readonly VITE_ANALOG_PAGE_TITLE?: string;
  readonly VITE_ANALOG_TIME_RANGE?: string;
  readonly VITE_ANALOG_PORT_DEV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
