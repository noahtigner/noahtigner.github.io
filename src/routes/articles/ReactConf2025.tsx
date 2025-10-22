import styled from '@emotion/styled';

import Divider from '../../components/Divider';
import MetaTags from '../../components/MetaTags';
import paths from '../../paths';
import { ReactComponent as ArticleContent } from '../../assets/content/ReactConf2025.md';
import inlinedStyles from '../../components/Articles/articles.css?inline';
import attributes from '../../assets/content/articles';
import { LinkInternal } from '../../components/Button';
import type { Route } from '../+types/Articles';

// tell React-Router to preload images for this page
export const links: Route.LinksFunction = () => {
  return [
    {
      rel: 'preload',
      href: attributes.reactConf2025.image,
      as: 'image',
      type: 'image/webp',
      fetchPriority: 'low',
    },
  ];
};

const ImgBox = styled.img`
  height: 100px;
  object-fit: contain;
  @media (max-width: 600px) {
    height: 60px;
  }
`;

function LogoDivider() {
  return (
    <Divider>
      <ImgBox src={attributes.reactConf2025.image} alt="React Conf Logo" />
    </Divider>
  );
}

export default function Article() {
  return (
    <>
      <MetaTags
        title={attributes.reactConf2025.title}
        description={attributes.reactConf2025.description}
      />
      <style>{inlinedStyles}</style>
      <section
        className="article-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <LogoDivider />
        <ArticleContent />
        <LinkInternal
          to={paths.articles}
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
