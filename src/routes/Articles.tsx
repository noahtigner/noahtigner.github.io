import styled from '@emotion/styled';
import MetaTags from '~/components/MetaTags';
import { paths } from '~/routes';
import ArticleCard from '~/components/Articles/ArticleCard';
import CollectionCard from '~/components/Articles/CollectionCard';
import { publishedArticles, interleaveArticles } from '~/utils/vite/markdown';
import Divider from '~/components/Divider';
import { LinkInternal } from '~/components/Button';
import VisuallyHidden from '~/components/VisuallyHidden';
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

const interleavedArticles = interleaveArticles(publishedArticles);

export default function Articles() {
  return (
    <PageContainer>
      <MetaTags
        title="Articles written by Noah Tigner"
        description={`Articles written by Noah Tigner: "Creating a Custom Github Pages 404 Page with React Router v7's Framework Mode", "React Conf 2025 Highlights", Notes on "Database Internals", and more`}
      />
      <Divider asHeading={1}>Articles</Divider>
      <section aria-labelledby="articles-list-heading">
        <VisuallyHidden as="h2" id="articles-list-heading">
          Article list
        </VisuallyHidden>
        <ArticleList>
          {interleavedArticles.map((item) =>
            item.type === 'standalone' ? (
              <ArticleCard key={item.article.path} {...item.article} />
            ) : (
              <CollectionCard key={item.group.slug} {...item.group} />
            )
          )}
        </ArticleList>
      </section>
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
