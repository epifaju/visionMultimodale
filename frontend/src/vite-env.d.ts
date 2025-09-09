/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_DIRECT_CONNECTION: string
  readonly VITE_CORS_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
