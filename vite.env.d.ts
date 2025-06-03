/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_ANALOG_GET_TOKEN?: string;
  readonly VITE_ANALOG_REDIS_URL: string;
  readonly VITE_ANALOG_PAGE_TITLE?: string;
  readonly VITE_ANALOG_TIME_RANGE?: string;
  readonly VITE_ANALOG_PORT_DEV?: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}