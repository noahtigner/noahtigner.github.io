import { lazy, Suspense } from 'react';
import { useParams } from 'react-router';
import attributes from '../assets/content/articles';
import Article from '../components/Articles/Article';
import { getFileNameFromPath } from '../utils/markdown';

// Map file names to their lazy-loaded components
// This is done at module initialization time, not during render
const componentMap: Record<string, ReturnType<typeof lazy>> = {};

// Initialize lazy components for all articles at module load time
for (const attr of attributes) {
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

export default function DynamicArticleRoute() {
  const params = useParams();
  const articlePath = `/articles/${params.slug}`;

  const articleAttributes = attributes.find(
    (attr) => attr.path === articlePath
  );

  if (!articleAttributes) {
    return <div>Article not found</div>;
  }

  const fileName = getFileNameFromPath(articleAttributes.path);
  if (!fileName) {
    return <div>Article not found</div>;
  }

  const ArticleContent = ArticleComponents[fileName];
  if (!ArticleContent) {
    return <div>Article content not found</div>;
  }

  return (
    <Article articleAttributes={articleAttributes}>
      <Suspense fallback={<div>Loading...</div>}>
        <ArticleContent />
      </Suspense>
    </Article>
  );
}
