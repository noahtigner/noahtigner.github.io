export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Parse heading elements from rendered article HTML.
 * Expects headings produced by markdown-it-anchor with `a.header-anchor` children.
 */
export function extractHeadings(html: string): TocHeading[] {
  const headings: TocHeading[] = [];
  // Match h2, h3, h4 with id attribute produced by markdown-it-anchor
  const regex = /<h([234])\s[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h[234]>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const level = Number(match[1]);
    const id = match[2];
    // Strip HTML tags from heading content to get plain text
    const text = match[3].replace(/<[^>]+>/g, '').trim();
    if (id && text) {
      headings.push({ id, text, level });
    }
  }

  return headings;
}
