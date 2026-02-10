import { describe, expect, it } from 'vitest';
import {
  extractLinksFromMarkdown,
  filterInternalLinks,
  normalizeArticlePath,
} from './links';

describe('extractLinksFromMarkdown', () => {
  it('should extract HTML anchor links', () => {
    const markdown = `
      Check out <a href="https://example.com">this link</a> and
      <a href="/articles/test/">this one</a>.
    `;
    const links = extractLinksFromMarkdown(markdown);
    expect(links).toContain('https://example.com');
    expect(links).toContain('/articles/test/');
  });

  it('should extract markdown-style links', () => {
    const markdown = `
      Check out [this link](https://example.com) and
      [this one](/articles/test/).
    `;
    const links = extractLinksFromMarkdown(markdown);
    expect(links).toContain('https://example.com');
    expect(links).toContain('/articles/test/');
  });

  it('should handle mixed link types', () => {
    const markdown = `
      HTML link: <a href="/path1/">Link 1</a>
      Markdown link: [Link 2](/path2/)
    `;
    const links = extractLinksFromMarkdown(markdown);
    expect(links).toHaveLength(2);
    expect(links).toContain('/path1/');
    expect(links).toContain('/path2/');
  });

  it('should handle links with attributes', () => {
    const markdown = `<a href="/test/" target="_blank" rel="noopener">Link</a>`;
    const links = extractLinksFromMarkdown(markdown);
    expect(links).toContain('/test/');
  });

  it('should return empty array for markdown with no links', () => {
    const markdown = 'This is just plain text without any links.';
    const links = extractLinksFromMarkdown(markdown);
    expect(links).toEqual([]);
  });

  it('should handle multiple links in one line', () => {
    const markdown =
      '[Link 1](/path1/) and [Link 2](/path2/) and <a href="/path3/">Link 3</a>';
    const links = extractLinksFromMarkdown(markdown);
    expect(links).toHaveLength(3);
  });
});

describe('filterInternalLinks', () => {
  it('should keep relative paths', () => {
    const links = ['/articles/test/', '/about/'];
    const internal = filterInternalLinks(links);
    expect(internal).toEqual(['/articles/test/', '/about/']);
  });

  it('should keep noahtigner.com links', () => {
    const links = [
      'https://noahtigner.com/articles/test/',
      'https://noahtigner.com/about/',
    ];
    const internal = filterInternalLinks(links);
    expect(internal).toEqual(['/articles/test/', '/about/']);
  });

  it('should filter out external links', () => {
    const links = [
      'https://example.com/page/',
      'https://noahtigner.com/articles/test/',
      'http://other-site.com/',
    ];
    const internal = filterInternalLinks(links);
    expect(internal).toEqual(['/articles/test/']);
  });

  it('should strip query params', () => {
    const links = ['/articles/test/?utm_source=twitter'];
    const internal = filterInternalLinks(links);
    expect(internal).toEqual(['/articles/test/']);
  });

  it('should strip anchors', () => {
    const links = ['/articles/test/#section'];
    const internal = filterInternalLinks(links);
    expect(internal).toEqual(['/articles/test/']);
  });

  it('should add trailing slash if missing', () => {
    const links = ['/articles/test', '/about'];
    const internal = filterInternalLinks(links);
    expect(internal).toEqual(['/articles/test/', '/about/']);
  });

  it('should filter out mailto and anchor-only links', () => {
    const links = ['mailto:test@example.com', '#section', '/valid/path/'];
    const internal = filterInternalLinks(links);
    expect(internal).toEqual(['/valid/path/']);
  });

  it('should handle empty strings', () => {
    const links = ['', '  ', '/valid/'];
    const internal = filterInternalLinks(links);
    expect(internal).toEqual(['/valid/']);
  });

  it('should handle complex URLs with query params and anchors', () => {
    const links = [
      'https://noahtigner.com/articles/test/?page=1&sort=date#comments',
    ];
    const internal = filterInternalLinks(links);
    expect(internal).toEqual(['/articles/test/']);
  });
});

describe('normalizeArticlePath', () => {
  it('should add trailing slash if missing', () => {
    expect(normalizeArticlePath('/articles/test')).toBe('/articles/test/');
  });

  it('should keep trailing slash if present', () => {
    expect(normalizeArticlePath('/articles/test/')).toBe('/articles/test/');
  });

  it('should strip query params', () => {
    expect(normalizeArticlePath('/articles/test/?page=1')).toBe(
      '/articles/test/'
    );
  });

  it('should strip anchors', () => {
    expect(normalizeArticlePath('/articles/test/#section')).toBe(
      '/articles/test/'
    );
  });

  it('should handle both query params and anchors', () => {
    expect(normalizeArticlePath('/articles/test/?page=1#section')).toBe(
      '/articles/test/'
    );
  });

  it('should handle root path', () => {
    expect(normalizeArticlePath('/')).toBe('/');
  });
});
