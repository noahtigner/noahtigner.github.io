import { z } from 'zod';

const articleAttributesSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  path: z.string(),
  image: z.string(),
  published: z.string().nullable(),
  updated: z.string().nullable(),
  minutesToRead: z.number().int().min(1),
});

export type ArticleAttributes = z.infer<typeof articleAttributesSchema>;

export const getAllArticleAttributes = (
  rawAttributes: unknown[]
): ArticleAttributes[] => {
  const articles: ArticleAttributes[] = [];

  for (const attrs of rawAttributes) {
    const parsedAttrs = articleAttributesSchema.safeParse(attrs);
    if (parsedAttrs.success) {
      articles.push(parsedAttrs.data);
    } else if (import.meta.env.DEV) {
      console.error(`Invalid article attributes:`, parsedAttrs.error);
    }
  }

  const sortedArticles = articles.sort((a, b) => {
    const dateA = new Date(b.published!);
    const dateB = new Date(a.published!);
    return dateA.getTime() - dateB.getTime();
  });

  return sortedArticles;
};
