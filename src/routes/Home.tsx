import styled from '@emotion/styled';

import Portfolio from '~/components/Portfolio/Portfolio';
import portfolioItems from '~/assets/data/portfolioItems.json';
import Divider from '~/components/Divider';
import ExperienceTimeline from '~/components/ExperienceTimeline';
import type { Route } from '~/router/routes/+types/Home';
import MetaTags from '~/components/MetaTags';
import ArticleCard from '~/components/Articles/ArticleCard';
import { ButtonLinkInternal } from '~/components/Button';
import { publishedArticles } from '~/utils/vite/markdown';
import { paths } from '~/routes';

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: var(--size-lg);
  margin-left: auto;
  margin-right: auto;
`;

const ArticleList = styled.div`
  display: flex;
  flex-direction: column;
  max-width: var(--size-md);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

const recentArticles = [...publishedArticles]
  .sort((a, b) => {
    if (!a.published) return 1;
    if (!b.published) return -1;
    return new Date(b.published).getTime() - new Date(a.published).getTime();
  })
  .slice(0, 3);

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
    <>
      <MetaTags
        title="Noah Tigner's Portfolio"
        description="Noah Tigner's portfolio and résumé. Check out my projects, view my experience, and get in touch. Articles on web development, software engineering, and more."
      />
      <FlexContainer>
        <Divider>A Few Things I&apos;ve Built</Divider>
        <Portfolio />
        <Divider>Experience</Divider>
        <ExperienceTimeline />
        <Divider>Articles</Divider>
        <ArticleList>
          {recentArticles.map((article) => (
            <ArticleCard key={article.path} {...article} />
          ))}
        </ArticleList>
        <ButtonLinkInternal
          to={paths.articles}
          prefetch="intent"
          style={{
            width: 'fit-content',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          View all articles &rarr;
        </ButtonLinkInternal>
      </FlexContainer>
    </>
  );
}
