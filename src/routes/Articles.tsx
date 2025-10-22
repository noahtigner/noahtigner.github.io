import MetaTags from '../components/MetaTags';
import paths from '../paths';
import ArticleCard from '../components/Articles/ArticleCard';
import type { Route } from './+types/Articles';
import { publishedArticles } from '../utils/markdown';
import Divider from '../components/Divider';
import { LinkInternal } from '../components/Button';

// tell React-Router to preload images for this page
export const links: Route.LinksFunction = () => {
  return publishedArticles.map((article) => ({
    rel: 'preload',
    href: article.image,
    as: 'image',
    type: 'image/webp',
    fetchPriority: 'low',
  }));
};

export default function Articles() {
  return (
    <>
      <MetaTags
        title="Articles"
        description="Articles written by Noah Tigner"
      />
      <Divider>Articles</Divider>
      <span
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 33%))',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '32px',
        }}
      >
        {publishedArticles.map((attrs) => (
          <ArticleCard key={attrs.path} {...attrs} />
        ))}
      </span>
      <LinkInternal
        to={paths.home}
        style={{
          width: 'fit-content',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '32px',
        }}
      >
        &lt; Back Home
      </LinkInternal>
    </>
  );
}
