/// <reference types="vite/client" />

interface ImportMetaEnv extends globalThis.Env {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
