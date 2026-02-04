import { writeFile } from 'node:fs/promises';

import getPrerenderPaths from './paths';
import { getAllArticles } from './markdown';
import type { ArticleAttributes } from '../shared/markdown';

const BASE_URL = 'https://noahtigner.com';

interface SitemapUrl {
  loc: string;
  priority: number;
  changefreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  lastmod?: string;
}

const LOW_PRIORITY_PATHS = ['/404/'];

const getGenericTagData = (path: string): SitemapUrl => {
  const level = path.match(/\//g)?.length || 1;
  const priority = LOW_PRIORITY_PATHS.includes(path)
    ? 0.1
    : Math.max(1.0 - (level - 1) * 0.1, 0.1);
  const changefreq = LOW_PRIORITY_PATHS.includes(path) ? 'monthly' : 'daily';
  return {
    loc: `${BASE_URL}${path}`,
    changefreq,
    priority,
  };
};

const parseDateString = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const getArticleTagData = (article: ArticleAttributes): SitemapUrl => {
  return {
    loc: `${BASE_URL}${article.path}`,
    changefreq: 'daily',
    priority: 0.8,
    lastmod: article.updated
      ? parseDateString(article.updated)
      : article.published
        ? parseDateString(article.published)
        : undefined,
  };
};

const generateSitemapData = async (): Promise<SitemapUrl[]> => {
  const paths = await getPrerenderPaths();
  const allArticles = await getAllArticles();
  const urls: SitemapUrl[] = paths.map((path) => {
    if (path.startsWith('/articles/')) {
      const articleAttributes = allArticles.find((attr) => attr.path === path);
      if (articleAttributes) {
        return getArticleTagData(articleAttributes);
      }
    }
    return getGenericTagData(path);
  });
  console.log('Sitemap URLs:', urls);
  return urls;
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const generateSitemapXml = async () => {
  const sitemapData = await generateSitemapData();

  const urlElements = sitemapData
    .map((url) => {
      let urlXml = `<url><loc>${escapeXml(url.loc)}</loc>`;
      urlXml += `<changefreq>${url.changefreq}</changefreq>`;
      urlXml += `<priority>${url.priority}</priority>`;
      if (url.lastmod) {
        urlXml += `<lastmod>${url.lastmod}</lastmod>`;
      }
      urlXml += '</url>';
      return urlXml;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlElements}</urlset>`;
};

const generateSitemap = async () => {
  const xml = await generateSitemapXml();
  try {
    await writeFile('dist/sitemap.xml', xml, 'utf-8');
  } catch (error) {
    console.error('Error writing sitemap to dist directory:', error);
  }
};

export default generateSitemap;
