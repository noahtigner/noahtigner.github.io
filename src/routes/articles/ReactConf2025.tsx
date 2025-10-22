import { ReactComponent as ArticleContent } from '../../assets/content/ReactConf2025.md';
import attributes from '../../assets/content/articles';
import Article from '../../components/Articles/Article';
import type { Route } from '../articles/+types/ReactConf2025';

const articleAttributes = attributes.find(
  (attr) => attr.title === 'React Conf 2025 Highlights'
);

// tell React-Router to preload images for this page
export const links: Route.LinksFunction = () => {
  return [
    {
      rel: 'preload',
      href: articleAttributes!.image,
      as: 'image',
      type: 'image/webp',
      fetchPriority: 'low',
    },
  ];
};

export default function ArticleRoute() {
  return (
    <Article articleAttributes={articleAttributes!}>
      <ArticleContent />
    </Article>
  );
}
