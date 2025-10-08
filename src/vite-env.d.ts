/// <reference types="vite/client" />

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ImportMetaEnv extends globalThis.Env {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
