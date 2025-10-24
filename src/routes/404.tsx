import { Navigate } from 'react-router';
import ErrorPage from '~/components/ErrorPage';
import paths from '~/paths';
import type { Route } from '~/router/routes/+types/404';

export default function NotFoundRoute({ matches }: Route.ComponentProps) {
  if (
    matches &&
    matches.length &&
    matches[matches.length - 1]?.id === 'catch-all'
  ) {
    return <Navigate to={paths.error404} replace />;
  }
  return <ErrorPage message="404" details="Not Found" />;
}
