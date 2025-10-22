import type { ComponentType } from 'react';

// Get all markdown files metadata
const attributeModules = import.meta.glob('../assets/content/*.md', {
  import: 'attributes',
  eager: true,
});

// Get the base name from a module path (e.g., './ReactConf2025.md' -> 'ReactConf2025')
export function getMarkdownFileName(modulePath: string): string {
  const match = modulePath.match(/\/([^/]+)\.md$/);
  return match ? match[1] : '';
}

// Map of markdown file names to their module paths
export const markdownFiles = Object.keys(attributeModules).reduce(
  (acc, modulePath) => {
    const fileName = getMarkdownFileName(modulePath);
    if (fileName) {
      acc[fileName] = modulePath;
    }
    return acc;
  },
  {} as Record<string, string>
);

// Dynamically import a markdown React component by file name
export async function importMarkdownComponent(
  fileName: string
): Promise<ComponentType> {
  const modules = import.meta.glob('../assets/content/*.md', {
    import: 'ReactComponent',
  });

  const modulePath = markdownFiles[fileName];
  if (!modulePath) {
    throw new Error(`Markdown file not found: ${fileName}`);
  }

  const loader = modules[modulePath];

  if (!loader) {
    throw new Error(`Markdown loader not found for: ${fileName}`);
  }

  const component = await loader();
  return component as ComponentType;
}

// Get markdown file name from article path (e.g., '/articles/react-conf-2025' -> 'ReactConf2025')
export function getFileNameFromPath(articlePath: string): string | null {
  const attributeEntries = Object.entries(attributeModules);

  for (const [modulePath, attrs] of attributeEntries) {
    const attributes = attrs as { path?: string };
    if (attributes.path === articlePath) {
      return getMarkdownFileName(modulePath);
    }
  }

  return null;
}
