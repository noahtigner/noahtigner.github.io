import { Link as RouterLink } from 'react-router';
import { Grid, Link } from '@mui/material';

import DividerWithText from '../components/DividerWithText';
import MetaTags from '../components/MetaTags';
import paths from '../paths';
import ArticleCard from '../components/Articles/ArticleCard';

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
          <ArticleCard
            title="React Conf 2025 Highlights"
            description="A summary of my key takeaways from React Conf 2025. Topics include the new React Compiler, React 19.2, Activity, ViewTransitions, and more."
            to={paths.articleReactConf2025}
            image="/images/react-conf-2025.svg"
          />
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
