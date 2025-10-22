import MetaTags from '../components/MetaTags';
import paths from '../paths';
import ArticleCard from '../components/Articles/ArticleCard';
import type { Route } from './+types/Articles';
import articleAttributes from '../assets/content/articles';
import Divider from '../components/Divider';
import { LinkInternal } from '../components/Button';

const confImageUrl = '/images/react-conf-2025.svg';

// tell React-Router to preload images for this page
export const links: Route.LinksFunction = () => {
  return [
    {
      rel: 'preload',
      href: confImageUrl,
      as: 'image',
      type: 'image/webp',
      fetchPriority: 'low',
    },
  ];
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
          gap: '4px',
          marginTop: '32px',
        }}
      >
        {Object.entries(articleAttributes).map(([key, attrs]) => (
          <ArticleCard key={key} {...attrs} />
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
