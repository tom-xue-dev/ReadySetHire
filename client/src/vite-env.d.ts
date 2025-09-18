/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_JWT_TOKEN: string
  readonly VITE_USERNAME: string
  readonly VITE_NODE_ENV: string
  readonly VITE_DEBUG: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}