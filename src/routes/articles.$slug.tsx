import { redirect } from 'react-router';

import Article from '~/components/Articles/Article';
import {
  allArticles,
  getFileNameFromPath,
  getMarkdownFileName,
} from '~/utils/markdown';
import paths from '~/paths';
import type { Route } from '~/router/routes/+types/articles.$slug';

// Use import.meta.glob to import markdown ReactComponent modules
// Since attributes are already eagerly imported in markdown.ts, we make this eager too
// to eliminate the bundling warning and keep everything consistent
const markdownModules = import.meta.glob('../assets/content/*.md', {
  import: 'html',
  eager: true,
});

// Map file names to their components
// Components are already loaded, so we just wrap them
const componentMap: Record<string, string> = {};

// Map components by file name
for (const [modulePath, html] of Object.entries(markdownModules)) {
  const fileName = getMarkdownFileName(modulePath);
  if (fileName) {
    componentMap[fileName] = html as string;
  }
}

// Create component wrappers outside of render for each article
// This satisfies the static-components rule
const ArticleComponents = Object.fromEntries(
  Object.entries(componentMap).map(([fileName, html]) => [
    fileName,
    function ArticleContent() {
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    },
  ])
);

export async function loader({ params }: Route.LoaderArgs) {
  const articlePath = `/articles/${params.slug}/`;
  const attributes = allArticles.find((attr) => attr.path === articlePath);

  if (!attributes) {
    return redirect(paths.error404, 404);
  }

  const fileName = getFileNameFromPath(attributes.path);
  if (!fileName || !ArticleComponents[fileName]) {
    return redirect(paths.error404, 404);
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
      <ArticleContent />
    </Article>
  );
}
