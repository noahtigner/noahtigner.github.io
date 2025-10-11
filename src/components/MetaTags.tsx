import { useEffect } from 'react';
import { useLocation } from 'react-router';
import ReactGA from 'react-ga';

export default function MetaTags({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { pathname, search } = useLocation();

  // Google Analytics
  useEffect(() => {
    ReactGA.pageview('https://noahtigner.com' + pathname + search);
  }, [pathname, search]);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:url" content={'https://noahtigner.com' + pathname} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </>
  );
}
