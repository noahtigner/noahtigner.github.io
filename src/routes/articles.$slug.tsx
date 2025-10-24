import { redirect } from 'react-router';
import Article from '~/components/Articles/Article';
import { allArticles, getFileNameFromPath } from '~/utils/markdown';
import type { Route } from '~/router/routes/+types/articles.$slug';
import paths from '~/paths';

export async function loader({ params }: Route.LoaderArgs) {
  const articlePath = `/articles/${params.slug}`;
  const attributes = allArticles.find((attr) => attr.path === articlePath);

  if (!attributes) {
    return redirect(paths.error404, 404);
  }

  const fileName = getFileNameFromPath(attributes.path);
  const { html: articleContent } = await import(
    `../assets/content/${fileName}.md`
  );

  return { attributes, articleContent };
}

export default function DynamicArticleRoute({
  loaderData,
}: Route.ComponentProps) {
  const { attributes, articleContent } = loaderData;
  return (
    <Article articleAttributes={attributes}>
      <div dangerouslySetInnerHTML={{ __html: articleContent }} />
    </Article>
  );
}
