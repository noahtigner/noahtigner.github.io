import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { paths } from '../../routes';
import { getArticlePaths } from './markdown';

const getFlashcardDeckPaths = async (): Promise<string[]> => {
  const filePath = join(
    process.cwd(),
    'src',
    'assets',
    'data',
    'flashcards.json'
  );
  const raw = await readFile(filePath, 'utf-8');
  const decks = JSON.parse(raw) as { slug: string }[];
  return decks.map((d) => `/flashcards/${d.slug}/`);
};

const getPrerenderPaths = async (): Promise<string[]> => {
  const nonSlugPaths = Object.values(paths).filter(
    (p) => !p.includes(':') && !p.includes('*')
  );
  const articlePaths = await getArticlePaths();
  const flashcardPaths = await getFlashcardDeckPaths();
  const deduped = new Set([
    ...nonSlugPaths,
    ...articlePaths,
    ...flashcardPaths,
  ]);
  return Array.from(deduped);
};

export default getPrerenderPaths;
