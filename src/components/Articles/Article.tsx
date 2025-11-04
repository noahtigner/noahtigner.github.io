import type { ReactNode } from 'react';
import styled from '@emotion/styled';
import syntaxStyles from 'highlight.js/styles/github-dark.min.css?inline';

import Divider from '~/components/Divider';
import MetaTags from '~/components/MetaTags';
import paths from '~/paths';
import inlinedStyles from '~/components/Articles/articles.css?inline';
import { LinkInternal } from '~/components/Button';
import { type ArticleAttributes } from '~/utils/markdown';

const ImgBox = styled.img`
  height: 100px;
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

export default function Article({
  articleAttributes,
  children,
}: {
  articleAttributes: ArticleAttributes;
  children: ReactNode;
}) {
  return (
    <>
      <MetaTags
        title={articleAttributes.title + ' | Noah Tigner'}
        description={articleAttributes.description}
      />
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
