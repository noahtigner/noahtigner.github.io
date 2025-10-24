import ErrorPage from '~/components/ErrorPage';

export default function NotFoundRoute() {
  return <ErrorPage message="404" details="Not Found" />;
}
