import { useLocation } from 'react-router';

export default function MetaTags({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { pathname } = useLocation();
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
