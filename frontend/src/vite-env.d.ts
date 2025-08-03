/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string
  readonly VITE_OPENROUTER_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_API_URL: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_ELEVENLABS_API_KEY: string
  readonly VITE_ETH_RPC_URL: string
  readonly VITE_BASE_RPC_URL: string
  readonly VITE_ARBITRUM_RPC_URL: string
  readonly VITE_OPTIMISM_RPC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}