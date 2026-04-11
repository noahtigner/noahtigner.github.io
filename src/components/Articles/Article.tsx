import type { ReactNode } from 'react';
import styled from '@emotion/styled';
import syntaxStyles from 'highlight.js/styles/github-dark.min.css?inline';

import Divider from '~/components/Divider';
import MetaTags from '~/components/MetaTags';
import { paths } from '~/routes';
import inlinedStyles from '~/components/Articles/articles.css?inline';
import { LinkInternal } from '~/components/Button';
import ForceDirectedGraph, {
  type ForceDirectedGraphProps,
} from '~/components/ForceDirectedGraph';
import TableOfContents from '~/components/Articles/TableOfContents';
import type { TocHeading } from '~/utils/shared/headings';
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

export const SIDENAV_WIDTH = 250;

const SideNavContainer = styled.aside`
  position: sticky;
  top: 4.75rem;
  align-self: flex-start;
  width: ${SIDENAV_WIDTH}px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const BottomNavContainer = styled.div`
  display: none;

  @media (max-width: 1024px) {
    display: block;
  }
`;

export const RightColumnSpacer = styled.div`
  @media (max-width: 1280px) {
    display: none;
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

export function ArticleHead({
  articleAttributes,
}: {
  articleAttributes: ArticleAttributes;
}) {
  return (
    <>
      <ArticleMetaTags articleAttributes={articleAttributes} />
      <style>{inlinedStyles}</style>
      <style>{syntaxStyles}</style>
    </>
  );
}

function ArticleNavigation({
  data,
  width,
  height,
  articleTitle,
}: ForceDirectedGraphProps & { articleTitle: string }) {
  return (
    <>
      <nav aria-label="Related articles graph">
        <ForceDirectedGraph
          data={data}
          width={width}
          height={height}
          ariaLabel={`Interactive graph showing connections between "${articleTitle}" and related articles`}
        />
      </nav>
      <LinkInternal
        to={paths.articles}
        prefetch="intent"
        aria-label="Return to all articles"
        style={{
          width: 'fit-content',
          display: 'block',
          marginTop: '1rem',
        }}
      >
        &lt; All Articles
      </LinkInternal>
    </>
  );
}

export function ArticleSidebar(
  props: ForceDirectedGraphProps & {
    articleTitle: string;
    headings: TocHeading[];
  }
) {
  return (
    <SideNavContainer aria-label="Article navigation and related content">
      <ArticleNavigation
        data={props.data}
        width={props.width}
        height={props.height}
        articleTitle={props.articleTitle}
      />
      <TableOfContents headings={props.headings} />
    </SideNavContainer>
  );
}

export function ArticleBottomNav(
  props: ForceDirectedGraphProps & { articleTitle: string }
) {
  return (
    <BottomNavContainer aria-label="Article navigation and related content">
      <Divider style={{ marginBottom: '1rem' }}>{null}</Divider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <ArticleNavigation
          data={props.data}
          width={props.width}
          height={props.height}
          articleTitle={props.articleTitle}
        />
      </div>
    </BottomNavContainer>
  );
}

export default function ArticleContainer({
  articleAttributes,
  children,
}: {
  articleAttributes: ArticleAttributes;
  children: ReactNode;
}) {
  const titleId = `article-title-${articleAttributes.path.replace(/\//g, '-')}`;

  return (
    <article
      className="article-container"
      aria-labelledby={titleId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        flexGrow: 1,
      }}
    >
      <header>
        <LogoDivider
          title={articleAttributes.title}
          imgSrc={articleAttributes.image}
        />
      </header>
      <section aria-label="Article body">{children}</section>
    </article>
  );
}
