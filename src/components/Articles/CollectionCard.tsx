import styled from '@emotion/styled';
import { LinkInternal } from '~/components/Button';
import { type CollectionGroup } from '~/utils/vite/markdown';

const CollectionRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-divider);

  &:last-child {
    border-bottom: none;
  }
`;

const Thumbnail = styled.img`
  width: 72px;
  height: 72px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: var(--border-radius);
  background-color: var(--color-paper);

  @media (max-width: 480px) {
    display: none;
  }
`;

const CollectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
`;

const CollectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  line-height: 1.4;
`;

const ArticleEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
`;

const ArticleTitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
`;

const ArticleLink = styled(LinkInternal)`
  font-size: 0.875rem;
  color: var(--color-text-primary);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;

  &::before {
    color: var(--color-text-secondary);
    content: '↳';
  }

  &:hover {
    text-decoration: underline;
    text-decoration-color: var(--color-ripple);
  }
`;

const ArticleMeta = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.7;
`;

const ArticleDescription = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  padding-left: 1.1em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  opacity: 0.7;
`;

export default function CollectionCard({ title, articles }: CollectionGroup) {
  const firstArticle = articles[0];

  return (
    <CollectionRow aria-label={title}>
      {firstArticle && (
        <Thumbnail src={firstArticle.image} alt="" aria-hidden="true" />
      )}
      <CollectionInfo>
        <CollectionTitle>{title}</CollectionTitle>
        {articles.map((article) => (
          <ArticleEntry key={article.path}>
            <ArticleTitleRow>
              <ArticleLink
                to={article.path}
                prefetch="viewport"
                aria-label={article.title}
              >
                {article.title}
              </ArticleLink>
              <ArticleMeta>
                {article.minutesToRead} min • {article.published}
              </ArticleMeta>
            </ArticleTitleRow>
            <ArticleDescription>
              {article?.collection?.shortDescription ?? article.description}
            </ArticleDescription>
          </ArticleEntry>
        ))}
      </CollectionInfo>
    </CollectionRow>
  );
}
