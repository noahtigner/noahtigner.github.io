import styled from '@emotion/styled';

import Portfolio from '~/components/Portfolio/Portfolio';
import portfolioItems from '~/assets/data/portfolioItems.json';
import Divider from '~/components/Divider';
import ExperienceTimeline from '~/components/ExperienceTimeline';
import type { Route } from '~/router/routes/+types/Home';

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

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
    <FlexContainer>
      <Divider>A Few Things I&apos;ve Built</Divider>
      <Portfolio />
      <Divider>Experience</Divider>
      <ExperienceTimeline />
    </FlexContainer>
  );
}
