import styled from '@emotion/styled';
import { LinkInternal } from '~/components/Button';
import { type ArticleAttributes } from '~/utils/vite/markdown';

const ArticleRow = styled(LinkInternal)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  text-decoration: none !important;
  color: inherit;
  border-bottom: 1px solid var(--color-divider);

  &:last-child {
    border-bottom: none;
  }

  &:hover h3 {
    text-decoration: underline;
    text-decoration-color: var(--color-ripple);
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

const ArticleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
`;

const ArticleTitle = styled.h3`
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  line-height: 1.4;
`;

const ArticleMeta = styled.p`
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0;
`;

const ArticleDescription = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export default function ArticleCard({
  title,
  description,
  path,
  image,
  published,
  minutesToRead,
}: ArticleAttributes) {
  return (
    <ArticleRow to={path} prefetch="viewport" aria-label={title}>
      <Thumbnail src={image} alt="" aria-hidden="true" />
      <ArticleInfo>
        <ArticleTitle>{title}</ArticleTitle>
        <ArticleMeta>
          {minutesToRead} min&thinsp;·&thinsp;{published}
        </ArticleMeta>
        <ArticleDescription>{description}</ArticleDescription>
      </ArticleInfo>
    </ArticleRow>
  );
}
