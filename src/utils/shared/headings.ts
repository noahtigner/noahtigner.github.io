export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Decode common HTML entities produced by markdown-it into their plaintext
 * equivalents.  This is intentionally limited to the subset of named character
 * references that markdown-it emits so that the function stays dependency-free
 * and safe to run in both browser and SSR environments.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Parse heading elements from rendered article HTML.
 * Expects headings produced by markdown-it-anchor with `a.header-anchor` children.
 */
export function extractHeadings(html: string): TocHeading[] {
  const headings: TocHeading[] = [];
  // Match h2, h3, h4 with id attribute produced by markdown-it-anchor
  // Capture group 1: heading level (2, 3, or 4)
  // Capture group 2: id attribute value (the anchor slug)
  // Capture group 3: heading inner content (may contain nested HTML tags)
  const regex = /<h([234])\s[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h[234]>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const level = Number(match[1]);
    const id = match[2];
    // Strip HTML tags from heading content to get plain text, then decode
    // HTML entities so that characters like "&" are not shown as "&amp;".
    // This operates on trusted markdown-generated HTML, not user input.
    let text = match[3];
    let previous: string;
    do {
      previous = text;
      text = text.replace(/<[^>]+>/g, '');
    } while (text !== previous);
    text = decodeHtmlEntities(text.trim());
    if (id && text) {
      headings.push({ id, text, level });
    }
  }

  return headings;
}

export function getArticleTitleId(articlePath: string) {
  return `article-title-${articlePath.replace(/\//g, '-')}`;
}
