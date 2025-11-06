import type { ReactNode } from 'react';
import styled from '@emotion/styled';
import syntaxStyles from 'highlight.js/styles/github-dark.min.css?inline';

import Divider from '~/components/Divider';
import MetaTags from '~/components/MetaTags';
import { paths } from '~/routes';
import inlinedStyles from '~/components/Articles/articles.css?inline';
import { LinkInternal } from '~/components/Button';
import { type ArticleAttributes } from '~/utils/vite/markdown';

const ImgBox = styled.img`
  height: 100px;
  width: auto;
  object-fit: contain;
  padding: 0 0.75rem;
  @media (max-width: 600px) {
    height: 60px;
  }
`;

function LogoDivider({ title, imgSrc }: { title: string; imgSrc: string }) {
  return (
    <Divider>
      <ImgBox src={imgSrc} alt={`${title} Logo`} />
    </Divider>
  );
}

function ArticleMetaTags({
  articleAttributes,
}: {
  articleAttributes: ArticleAttributes;
}) {
  return (
    <>
      <MetaTags
        title={articleAttributes.title + ' | Noah Tigner'}
        description={articleAttributes.description}
      />
      <meta
        property="article:published_time"
        content={
          articleAttributes.published
            ? new Date(articleAttributes.published).toISOString()
            : ''
        }
      />
      <meta property="article:author" content="Noah Tigner" />
      <meta
        property="article:tag"
        content={articleAttributes.tags.join(', ')}
      />
      <meta property="og:image" content={articleAttributes.image} />
    </>
  );
}

export default function Article({
  articleAttributes,
  children,
}: {
  articleAttributes: ArticleAttributes;
  children: ReactNode;
}) {
  return (
    <>
      <ArticleMetaTags articleAttributes={articleAttributes} />
      <style>{inlinedStyles}</style>
      <style>{syntaxStyles}</style>
      <section
        className="article-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <LogoDivider
          title={articleAttributes.title}
          imgSrc={articleAttributes.image}
        />
        {children}
        <LinkInternal
          to={paths.articles}
          prefetch="intent"
          style={{
            width: 'fit-content',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '1rem',
          }}
        >
          &lt; All Articles
        </LinkInternal>
      </section>
    </>
  );
}
