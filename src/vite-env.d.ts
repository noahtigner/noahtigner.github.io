/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ImportMetaEnv extends globalThis.Env {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.md' {
  import { VFC } from 'react';

  const ReactComponent: VFC;
  export { ReactComponent };
}
