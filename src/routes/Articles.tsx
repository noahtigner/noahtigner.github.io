import styled from '@emotion/styled';
import MetaTags from '~/components/MetaTags';
import { paths } from '~/routes';
import ArticleCard from '~/components/Articles/ArticleCard';
import { publishedArticles } from '~/utils/vite/markdown';
import Divider from '~/components/Divider';
import { LinkInternal } from '~/components/Button';
import type { Route } from '~/router/routes/+types/Articles';

const PageContainer = styled.div`
  width: 100%;
  max-width: var(--size-lg);
  margin-left: auto;
  margin-right: auto;
`;

const ArticleGrid = styled.span`
  display: inline-grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 33%));
  justify-content: center;
  gap: 1rem;
  margin-top: 32px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 50%));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

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
    <PageContainer>
      <MetaTags
        title="Articles written by Noah Tigner"
        description={`Articles written by Noah Tigner: "Creating a Custom Github Pages 404 Page with React Router v7's Framework Mode", "React Conf 2025 Highlights", Notes on "Database Internals", and more`}
      />
      <Divider>Articles</Divider>
      <ArticleGrid>
        {publishedArticles.map((attrs) => (
          <ArticleCard key={attrs.path} {...attrs} />
        ))}
      </ArticleGrid>
      <LinkInternal
        to={paths.home}
        prefetch="intent"
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
    </PageContainer>
  );
}
