import ErrorPage from '~/components/ErrorPage';

export default function NotFoundRoute() {
  return (
    <ErrorPage message="404" details="The requested page could not be found" />
  );
}
