/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import type { VFC } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ImportMetaEnv extends globalThis.Env {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// TODO: remove what not used
declare module '*.md' {
  // When "Mode.HTML" is requested
  const html: string;

  // When "Mode.React" is requested. VFC could take a generic like React.VFC<{ MyComponent: TypeOfMyComponent }>
  const ReactComponent: VFC;

  // // When "Mode.RAW" is requested
  // const raw: string;

  // Modify below per your usage
  // export { attributes, toc, html, ReactComponent, VueComponent, VueComponentWith };
  export { html, ReactComponent };
}
