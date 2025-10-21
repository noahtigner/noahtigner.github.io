import { Link as RouterLink } from 'react-router';
import { Container, Link, styled } from '@mui/material';
import Portfolio from '../components/Portfolio';
import Experience from '../components/Experience';
import paths from '../paths';
import portfolioItems from '../assets/data/portfolioItems.json';
import type { Route } from '../+types/root';
import Divider from '../components/Divider';

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
  return portfolioItems
    .map((item) => ({
      rel: 'preload',
      href: item.image.lg,
      as: 'image',
      type: 'image/webp',
      fetchPriority: 'high',
      media: '(min-width: 768px)', // Only preload large on desktop
    }))
    .concat(
      portfolioItems.map((item, i) => ({
        rel: 'preload',
        href: item.image.sm, // Small for mobile
        as: 'image',
        type: 'image/webp',
        fetchPriority: i === 0 ? 'high' : 'auto',
        media: '(max-width: 767px)', // Only preload small on mobile
      }))
    );
};

export default function Home() {
  return (
    <FlexContainer maxWidth="lg">
      <Divider>A Few Things I&apos;ve Built</Divider>
      <Portfolio />
      <Divider>Experience</Divider>
      <Experience />
      <Link component={RouterLink} to={paths.articles}>
        Articles
      </Link>
    </FlexContainer>
  );
}
