import { Link as RouterLink } from 'react-router';
import { Container, Link, styled } from '@mui/material';
import Experience from '../components/Experience';
import Portfolio from '../components/Portfolio';
import DividerWithText from '../components/DividerWithText';
import paths from '../paths';
import portfolioItems from '../assets/data/portfolioItems.json';
import type { Route } from '../+types/root';

const FlexContainer = styled(Container)(({ theme }) => ({
  marginBottom: 0,
  marginX: 'auto',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

// tell React-Router to preload portfolio images for this page
export const links: Route.LinksFunction = () => {
  return portfolioItems.map((item) => ({
    rel: 'preload',
    href: item.image.lg,
    as: 'image',
    type: 'image/webp',
    fetchPriority: 'low',
  }));
};

export default function Home() {
  return (
    <FlexContainer maxWidth="lg">
      <DividerWithText>A Few Things I&apos;ve Built</DividerWithText>
      <Portfolio />
      <DividerWithText>Experience</DividerWithText>
      <Experience />
      <Link component={RouterLink} to={paths.articles}>
        Articles
      </Link>
    </FlexContainer>
  );
}
