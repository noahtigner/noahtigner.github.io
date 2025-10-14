import { type RouteConfig, index, route } from '@react-router/dev/routes';
import paths from './paths';

export default [
  index('routes/Home.tsx'),
  route(paths.articles, 'routes/Articles.tsx'),
  route(paths.articleReactConf2025, 'routes/articles/ReactConf2025.tsx'),
] satisfies RouteConfig;
