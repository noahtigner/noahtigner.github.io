/**
 * Extract all links from markdown content
 * Handles both HTML <a> tags and markdown []() syntax
 */
export function extractLinksFromMarkdown(content: string): string[] {
  const links: string[] = [];

  // Match HTML <a> tags with href attribute
  const htmlLinkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = htmlLinkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }

  // Match markdown []() links
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    links.push(match[2]);
  }

  return links;
}

/**
 * Filter and normalize internal links
 * Keeps only noahtigner.com links and relative paths
 * Strips query params and anchors, and enforces a trailing slash for consistency
 */
export function filterInternalLinks(links: string[]): string[] {
  const internalLinks: string[] = [];

  for (const link of links) {
    // Skip empty links
    if (!link || link.trim() === '') continue;

    // Parse the link to extract the path
    let path: string;

    // Handle relative paths
    if (link.startsWith('/')) {
      path = link;
    }
    // Handle full URLs
    else if (link.startsWith('http://') || link.startsWith('https://')) {
      try {
        const url = new URL(link);
        // Only keep noahtigner.com links
        if (url.hostname !== 'noahtigner.com') {
          continue;
        }
        path = url.pathname;
      } catch {
        // Invalid URL, skip it
        continue;
      }
    }
    // Skip other types of links (mailto:, #anchors, etc.)
    else {
      continue;
    }

    // Strip query params and anchors
    path = path.split('?')[0].split('#')[0];

    // Ensure trailing slash for consistency
    if (!path.endsWith('/')) {
      path += '/';
    }

    internalLinks.push(path);
  }

  return internalLinks;
}

/**
 * Normalize article path for comparison
 * Ensures consistent format with trailing slash
 */
export function normalizeArticlePath(path: string): string {
  // Remove query params and anchors
  let normalized = path.split('?')[0].split('#')[0];

  // Ensure trailing slash
  if (!normalized.endsWith('/')) {
    normalized += '/';
  }

  return normalized;
}
