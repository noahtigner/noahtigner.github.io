import { type RouteConfig, index, route } from '@react-router/dev/routes';

export const paths = {
  home: '/',
  articles: '/articles/',
  article: '/articles/:slug/',
  flashcards: '/flashcards/',
  flashcardDeck: '/flashcards/:deck/',
  error404: '/404/',
} as const;

export default [
  index('routes/Home.tsx'),
  route(paths.articles, './routes/Articles.tsx'),
  route(paths.article, './routes/Articles.$slug.tsx'),
  route(paths.flashcards, './routes/Flashcards.tsx'),
  route(paths.flashcardDeck, './routes/Flashcards.$deck.tsx'),
  route(paths.error404, './routes/404.tsx'),
] satisfies RouteConfig;
