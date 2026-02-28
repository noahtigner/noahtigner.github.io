import styled from '@emotion/styled';
import MetaTags from '~/components/MetaTags';
import { paths } from '~/routes';
import ArticleCard from '~/components/Articles/ArticleCard';
import {
  publishedArticles,
  groupArticlesByCollection,
} from '~/utils/vite/markdown';
import Divider from '~/components/Divider';
import { LinkInternal } from '~/components/Button';
import type { Route } from '~/router/routes/+types/Articles';

const PageContainer = styled.div`
  width: 100%;
  max-width: var(--size-md);
  margin-left: auto;
  margin-right: auto;
`;

const ArticleList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
`;

const CollectionSection = styled.section`
  margin-top: 2rem;

  &:first-of-type {
    margin-top: 0;
  }
`;

const CollectionHeader = styled.h3`
  font-size: 0.8125rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
  margin: 0 0 0.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-divider);
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

const { standalone, collections } =
  groupArticlesByCollection(publishedArticles);

export default function Articles() {
  return (
    <PageContainer>
      <MetaTags
        title="Articles written by Noah Tigner"
        description={`Articles written by Noah Tigner: "Creating a Custom Github Pages 404 Page with React Router v7's Framework Mode", "React Conf 2025 Highlights", Notes on "Database Internals", and more`}
      />
      <Divider>Articles</Divider>
      <ArticleList>
        {standalone.length > 0 && (
          <CollectionSection aria-label="Standalone articles">
            {standalone.map((attrs) => (
              <ArticleCard key={attrs.path} {...attrs} />
            ))}
          </CollectionSection>
        )}
        {collections.map((group) => (
          <CollectionSection key={group.slug} aria-label={group.title}>
            <CollectionHeader>{group.title}</CollectionHeader>
            {group.articles.map((attrs) => (
              <ArticleCard key={attrs.path} {...attrs} />
            ))}
          </CollectionSection>
        ))}
      </ArticleList>
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
