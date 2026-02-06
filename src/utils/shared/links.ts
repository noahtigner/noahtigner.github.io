const INTERNAL_HOSTNAME = 'noahtigner.com';

/**
 * Extract all href values from HTML anchor tags in the given text.
 * Matches `<a href="...">` patterns.
 */
export function extractHtmlLinks(text: string): string[] {
  const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    links.push(match[1]);
  }
  return links;
}

/**
 * Extract all URLs from markdown-style links in the given text.
 * Matches `[text](url)` patterns, but excludes image links `![alt](url)`.
 */
export function extractMarkdownLinks(text: string): string[] {
  const regex = /(?<!!)\[([^\]]*)\]\(([^)]+)\)/g;
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    links.push(match[2]);
  }
  return links;
}

/**
 * Determine whether a URL is an internal link (pointing to noahtigner.com).
 * Internal links are:
 * - Relative paths starting with "/" (e.g., "/articles/foo/")
 * - Absolute URLs with the hostname "noahtigner.com"
 */
export function isInternalLink(url: string): boolean {
  if (url.startsWith('/')) {
    return true;
  }
  try {
    const parsed = new URL(url);
    return parsed.hostname === INTERNAL_HOSTNAME;
  } catch {
    return false;
  }
}

/**
 * Normalize a URL to its pathname. For absolute URLs, extracts the pathname.
 * For relative paths, returns as-is. Ensures trailing slash.
 */
export function normalizeToPath(url: string): string {
  let path: string;
  try {
    const parsed = new URL(url);
    path = parsed.pathname;
  } catch {
    path = url;
  }
  // Ensure trailing slash for consistency
  if (!path.endsWith('/')) {
    path += '/';
  }
  return path;
}

/**
 * Extract all internal article links from a markdown document's raw text.
 * Parses both HTML anchor tags and markdown-style links,
 * filters to only internal links, and normalizes them to paths.
 * Returns deduplicated paths.
 */
export function extractInternalLinks(markdownContent: string): string[] {
  const htmlLinks = extractHtmlLinks(markdownContent);
  const mdLinks = extractMarkdownLinks(markdownContent);
  const allLinks = [...htmlLinks, ...mdLinks];

  const internalPaths = allLinks.filter(isInternalLink).map(normalizeToPath);

  return [...new Set(internalPaths)];
}
