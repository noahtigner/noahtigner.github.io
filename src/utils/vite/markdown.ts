import {
  getAllArticleAttributes,
  type ArticleAttributes,
} from '~/utils/shared/markdown';

// Get all markdown files metadata
const attributeModules = import.meta.glob('../../assets/articles/*.md', {
  import: 'attributes',
  eager: true,
});

const allArticles: ArticleAttributes[] = getAllArticleAttributes(
  Object.values(attributeModules)
);

const publishedArticles = allArticles.filter((attr) => attr.published);

// Get the base name from a module path (e.g., './ReactConf2025.md' -> 'ReactConf2025')
function getMarkdownFileName(modulePath: string): string {
  const match = modulePath.match(/\/([^/]+)\.md$/);
  return match ? match[1] : '';
}

// Get markdown file name from article path (e.g., '/articles/react-conf-2025' -> 'ReactConf2025')
function getFileNameFromPath(articlePath: string): string | null {
  const attributeEntries = Object.entries(attributeModules);

  for (const [modulePath, attrs] of attributeEntries) {
    const attributes = attrs as { path?: string };
    if (attributes.path === articlePath) {
      return getMarkdownFileName(modulePath);
    }
  }

  return null;
}

export {
  allArticles,
  publishedArticles,
  getFileNameFromPath,
  getMarkdownFileName,
  type ArticleAttributes,
};
