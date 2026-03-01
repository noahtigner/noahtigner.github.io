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

type InterleavedItem =
  | { type: 'standalone'; article: ArticleAttributes }
  | { type: 'collection'; group: CollectionGroup };

// Interleave standalone articles and collection groups ordered by `published`
// (desc). Collections are kept intact; their sort position is determined by the
// `order === 0` article's published date. Within a collection, articles are
// ordered by `collection.order` ascending.
function interleaveArticles(articles: ArticleAttributes[]): InterleavedItem[] {
  const { standalone, collections } = groupArticlesByCollection(articles);

  // Build a date anchor for each collection from its first article (order === 0)
  const collectionAnchorDate = new Map<string, number>();
  for (const group of collections) {
    const first = group.articles.find((a) => a.collection?.order === 0);
    if (first?.published) {
      collectionAnchorDate.set(group.slug, new Date(first.published).getTime());
    }
  }

  const standaloneItems: InterleavedItem[] = standalone.map((article) => ({
    type: 'standalone',
    article,
  }));
  const collectionItems: InterleavedItem[] = collections.map((group) => ({
    type: 'collection',
    group,
  }));

  const getDate = (item: InterleavedItem): number => {
    if (item.type === 'standalone') {
      return item.article.published
        ? new Date(item.article.published).getTime()
        : -Infinity;
    }
    return collectionAnchorDate.get(item.group.slug) ?? -Infinity;
  };

  return [...standaloneItems, ...collectionItems].sort(
    (a, b) => getDate(b) - getDate(a)
  );
}

export {
  allArticles,
  publishedArticles,
  groupArticlesByCollection,
  interleaveArticles,
  getFileNameFromPath,
  getMarkdownFileName,
  type ArticleAttributes,
  type ArticleCollection,
  type CollectionGroup,
  type GroupedArticles,
  type InterleavedItem,
};
