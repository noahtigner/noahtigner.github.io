import { type RouteConfig, index, route } from '@react-router/dev/routes';
import paths from './paths';

export default [
  index('routes/Home.tsx'),
  route(paths.articles, './routes/Articles.tsx'),
  route(paths.article, './routes/articles.$slug.tsx'),
  route(paths.error404, './routes/404.tsx'),
] satisfies RouteConfig;
