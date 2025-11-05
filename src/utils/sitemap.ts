import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://noahtigner.com';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
}

// Note: ArticleAttributes interface is duplicated from markdown.ts
// This is intentional as this file needs to work in a Node.js build context
// where Vite's import.meta.glob is not available, while markdown.ts works
// in the Vite browser context. Similarly, frontmatter parsing is duplicated
// because we need to use Node.js fs APIs here for the build plugin.
interface ArticleAttributes {
  title?: string;
  description?: string;
  tags?: string[];
  path?: string;
  image?: string;
  published?: string | null;
  minutesToRead?: number;
}

/**
 * Parse frontmatter from markdown file
 */
function parseFrontmatter(content: string): ArticleAttributes | null {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const frontmatter = match[1];
  const attributes: Partial<ArticleAttributes> = {};

  // Parse YAML-like frontmatter
  const lines = frontmatter.split('\n');
  let currentKey: keyof ArticleAttributes | null = null;
  let currentArray: string[] = [];

  for (const line of lines) {
    // Check for array item
    if (line.trim().startsWith('- ')) {
      const value = line.trim().substring(2).trim();
      // Remove quotes if present
      const cleanValue = value.replace(/^['"](.*)['"]$/, '$1');
      currentArray.push(cleanValue);
    } else if (line.includes(':')) {
      // Save previous array if any
      if (currentKey && currentArray.length > 0) {
        attributes[currentKey] = currentArray as never;
        currentArray = [];
      }

      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      currentKey = key.trim() as keyof ArticleAttributes;

      if (value) {
        // Remove quotes if present
        const cleanValue = value.replace(/^['"](.*)['"]$/, '$1');
        attributes[currentKey] = (
          cleanValue === 'null' ? null : cleanValue
        ) as never;
        currentKey = null;
      }
    }
  }

  // Save last array if any
  if (currentKey && currentArray.length > 0) {
    attributes[currentKey] = currentArray as never;
  }

  return attributes as ArticleAttributes;
}

/**
 * Get all published articles from markdown files
 */
function getPublishedArticles(contentDir: string): ArticleAttributes[] {
  const articles: ArticleAttributes[] = [];

  if (!fs.existsSync(contentDir)) {
    return articles;
  }

  const files = fs.readdirSync(contentDir);

  for (const file of files) {
    if (!file.endsWith('.md')) {
      continue;
    }

    const filePath = path.join(contentDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const attributes = parseFrontmatter(content);

    if (attributes && attributes.published && attributes.path) {
      articles.push(attributes);
    }
  }

  // Sort by published date
  return articles.sort((a, b) => {
    const dateA = new Date(a.published || 0);
    const dateB = new Date(b.published || 0);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Generate a sitemap XML string for the site
 * @param contentDir - Directory containing markdown files (optional, for Node.js usage)
 * @returns XML string containing the sitemap
 */
export function generateSitemap(contentDir?: string): string {
  const urls: SitemapUrl[] = [];

  // Add home page
  urls.push({
    loc: SITE_URL + '/',
    changefreq: 'weekly',
    priority: 1.0,
  });

  // Add articles list page
  urls.push({
    loc: SITE_URL + '/articles/',
    changefreq: 'weekly',
    priority: 0.9,
  });

  // Add dynamic article paths from published articles
  if (contentDir) {
    const publishedArticles = getPublishedArticles(contentDir);
    for (const article of publishedArticles) {
      urls.push({
        loc: SITE_URL + article.path,
        lastmod: article.published
          ? new Date(article.published).toISOString().split('T')[0]
          : undefined,
        changefreq: 'monthly',
        priority: 0.8,
      });
    }
  }

  // Generate XML
  const urlElements = urls
    .map((url) => {
      let urlXml = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n`;
      if (url.lastmod) {
        urlXml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      if (url.changefreq) {
        urlXml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      if (url.priority !== undefined) {
        urlXml += `    <priority>${url.priority}</priority>\n`;
      }
      urlXml += '  </url>';
      return urlXml;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
