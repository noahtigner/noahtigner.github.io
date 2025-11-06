import { paths } from '../../routes';
import { getArticlePaths } from './markdown';

const getPrerenderPaths = async (): Promise<string[]> => {
  const nonSlugPaths = Object.values(paths).filter(
    (p) => !p.includes(':') && !p.includes('*')
  );
  const articlePaths = await getArticlePaths();
  const deduped = new Set([...nonSlugPaths, ...articlePaths]);
  return Array.from(deduped);
};

export default getPrerenderPaths;
