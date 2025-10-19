import { Link as RouterLink } from 'react-router';
import { Grid, Link } from '@mui/material';

import DividerWithText from '../components/DividerWithText';
import MetaTags from '../components/MetaTags';
import paths from '../paths';
import ArticleCard from '../components/Articles/ArticleCard';
import type { Route } from './+types/Articles';
import articleAttributes from '../assets/content/articles';

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
      <DividerWithText>Articles</DividerWithText>
      <Grid
        container
        spacing={2}
        style={{ marginTop: 32 }}
        justifyContent={'center'}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          {Object.entries(articleAttributes).map(([key, attrs]) => {
            return (
              <ArticleCard
                key={key}
                title={attrs.title}
                description={attrs.description}
                to={attrs.path}
                image={attrs.image}
              />
            );
          })}
        </Grid>
      </Grid>
      <Link
        component={RouterLink}
        to={paths.home}
        marginTop={4}
        display="inline-block"
      >
        &lt; Back Home
      </Link>
    </>
  );
}
