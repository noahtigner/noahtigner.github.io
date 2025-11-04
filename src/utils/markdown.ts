import { z } from 'zod';

// Get all markdown files metadata
const attributeModules = import.meta.glob('../assets/content/*.md', {
  import: 'attributes',
  eager: true,
});

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  path: z.string(),
  image: z.string(),
  published: z.string().nullable(),
  minutesToRead: z.number().int().min(1),
});

type ArticleAttributes = z.infer<typeof articleSchema>;

const allArticles: z.infer<typeof articleSchema>[] = [];
for (const modulePath in attributeModules) {
  const attrs = attributeModules[modulePath] as unknown;
  const parsedAttrs = articleSchema.safeParse(attrs);
  if (parsedAttrs.success) {
    allArticles.push(parsedAttrs.data);
  } else if (import.meta.env.DEV) {
    console.error(
      `Invalid article attributes in ${modulePath}:`,
      parsedAttrs.error
    );
  }
}

const publishedArticles = allArticles
  .filter((attr) => attr.published)
  .sort((a, b) => {
    const dateA = new Date(a.published!);
    const dateB = new Date(b.published!);
    return dateA.getTime() - dateB.getTime();
  });

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
