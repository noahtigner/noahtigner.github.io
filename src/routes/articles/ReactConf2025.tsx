import { Link as RouterLink } from 'react-router';
import { Box, Link } from '@mui/material';

import Divider from '../../components/Divider';
import MetaTags from '../../components/MetaTags';
import paths from '../../paths';
import type { Route } from '../+types/Articles';
import { ReactComponent as ArticleContent } from '../../assets/content/ReactConf2025.md';
import inlinedStyles from '../../components/Articles/articles.css?inline';
import attributes from '../../assets/content/articles';

// tell React-Router to preload images for this page
export const links: Route.LinksFunction = () => {
  return [
    {
      rel: 'preload',
      href: attributes.reactConf2025.image,
      as: 'image',
      type: 'image/webp',
      fetchPriority: 'low',
    },
  ];
};

function LogoDivider() {
  return (
    <Divider>
      <Box
        component="img"
        src={attributes.reactConf2025.image}
        alt="React Conf Logo"
        sx={{ height: { xs: 60, md: 100 } }}
      />
    </Divider>
  );
}

export default function Article() {
  return (
    <>
      <MetaTags
        title={attributes.reactConf2025.title}
        description={attributes.reactConf2025.description}
      />
      <style>{inlinedStyles}</style>
      <section
        className="article-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <LogoDivider />
        <ArticleContent />
        <Link component={RouterLink} to={paths.articles}>
          &lt; All Articles
        </Link>
      </section>
    </>
  );
}
