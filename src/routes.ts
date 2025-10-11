import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/Home.tsx'),
  route('articles', 'routes/Articles.tsx'),
] satisfies RouteConfig;
