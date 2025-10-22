import { type RouteConfig, index, route } from '@react-router/dev/routes';
import paths from './paths';

export default [
  index('routes/Home.tsx'),
  route(paths.articles, 'routes/Articles.tsx'),
  route('/articles/:slug', 'routes/articles.$slug.tsx'),
] satisfies RouteConfig;
