import { lazy, Suspense } from 'react';
import { redirect } from 'react-router';
import Article from '../components/Articles/Article';
import { allArticles, getFileNameFromPath } from '../utils/markdown';
import type { Route } from './+types/articles.$slug';

// Map file names to their lazy-loaded components
// This is done at module initialization time, not during render
const componentMap: Record<string, ReturnType<typeof lazy>> = {};

// Initialize lazy components for all articles at module load time
for (const attr of allArticles) {
  const fileName = getFileNameFromPath(attr.path);
  if (fileName) {
    componentMap[fileName] = lazy(() =>
      import(`../assets/content/${fileName}.md`).then((module) => ({
        default: module.ReactComponent,
      }))
    );
  }
}

// Create component wrappers outside of render for each article
// This satisfies the static-components rule
const ArticleComponents = Object.fromEntries(
  Object.entries(componentMap).map(([fileName, LazyComponent]) => [
    fileName,
    function ArticleContent() {
      return <LazyComponent />;
    },
  ])
);

export function loader({ params }: Route.LoaderArgs) {
  const articlePath = `/articles/${params.slug}`;
  const attributes = allArticles.find((attr) => attr.path === articlePath);

  if (!attributes) {
    throw redirect('/404', 404);
  }

  const fileName = getFileNameFromPath(attributes.path);
  if (!fileName || !ArticleComponents[fileName]) {
    throw redirect('/404', 404);
  }

  return { fileName, attributes };
}

export default function DynamicArticleRoute({
  loaderData,
}: Route.ComponentProps) {
  const { fileName, attributes } = loaderData;
  const ArticleContent = ArticleComponents[fileName];

  return (
    <Article articleAttributes={attributes}>
      <Suspense fallback={<div>Loading...</div>}>
        <ArticleContent />
      </Suspense>
    </Article>
  );
}
