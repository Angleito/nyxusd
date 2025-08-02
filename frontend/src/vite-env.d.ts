/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string
  readonly VITE_OPENROUTER_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_API_URL: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_USE_MOCK_AI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}