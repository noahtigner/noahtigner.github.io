import { Link as RouterLink } from 'react-router';
import { Link } from '@mui/material';

import DividerWithText from '../components/DividerWithText';
import MetaTags from '../components/MetaTags';
import paths from '../paths';

export default function Articles() {
  return (
    <>
      <MetaTags
        title="Articles"
        description="Articles written by Noah Tigner"
      />
      <div style={{ minHeight: '80vh' }}>
        <DividerWithText>Articles</DividerWithText>
        <div style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
          Check back soon ;)
        </div>
        <Link component={RouterLink} to={paths.home}>
          Back Home
        </Link>
      </div>
    </>
  );
}
