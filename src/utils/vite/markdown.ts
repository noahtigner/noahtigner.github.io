import {
  getAllArticleAttributes,
  type ArticleAttributes,
  type ArticleCollection,
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

type CollectionGroup = {
  slug: string;
  title: string;
  articles: ArticleAttributes[];
};

type GroupedArticles = {
  standalone: ArticleAttributes[];
  collections: CollectionGroup[];
};

function groupArticlesByCollection(
  articles: ArticleAttributes[]
): GroupedArticles {
  const standalone: ArticleAttributes[] = [];
  const collectionMap = new Map<string, CollectionGroup>();

  for (const article of articles) {
    if (!article.collection) {
      standalone.push(article);
    } else {
      const { slug, title } = article.collection;
      if (!collectionMap.has(slug)) {
        collectionMap.set(slug, { slug, title, articles: [] });
      }
      const group = collectionMap.get(slug)!;
      group.articles.push(article);
    }
  }

  for (const group of collectionMap.values()) {
    group.articles.sort(
      (a, b) => (a.collection?.order ?? 0) - (b.collection?.order ?? 0)
    );
  }

  return {
    standalone,
    collections: Array.from(collectionMap.values()),
  };
}

export {
  allArticles,
  publishedArticles,
  groupArticlesByCollection,
  getFileNameFromPath,
  getMarkdownFileName,
  type ArticleAttributes,
  type ArticleCollection,
  type CollectionGroup,
  type GroupedArticles,
};
