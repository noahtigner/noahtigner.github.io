import { describe, it, expect } from 'vitest';
import {
  extractHtmlLinks,
  extractMarkdownLinks,
  isInternalLink,
  normalizeToPath,
  extractInternalLinks,
} from './links';

describe('extractHtmlLinks', () => {
  it('extracts href from a single anchor tag', () => {
    const text = '<a href="https://example.com">Example</a>';
    expect(extractHtmlLinks(text)).toEqual(['https://example.com']);
  });

  it('extracts hrefs from multiple anchor tags', () => {
    const text =
      '<a href="/articles/foo/">Foo</a> and <a href="https://bar.com" target="_blank">Bar</a>';
    expect(extractHtmlLinks(text)).toEqual([
      '/articles/foo/',
      'https://bar.com',
    ]);
  });

  it('handles single-quoted attributes', () => {
    const text = "<a href='/articles/test/'>Test</a>";
    expect(extractHtmlLinks(text)).toEqual(['/articles/test/']);
  });

  it('handles anchor tags with extra attributes', () => {
    const text =
      '<a href="https://noahtigner.com/articles/chapter-1/" target="_blank" rel="noopener">Ch 1</a>';
    expect(extractHtmlLinks(text)).toEqual([
      'https://noahtigner.com/articles/chapter-1/',
    ]);
  });

  it('returns empty array when no anchor tags exist', () => {
    expect(extractHtmlLinks('No links here')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(extractHtmlLinks('')).toEqual([]);
  });
});

describe('extractMarkdownLinks', () => {
  it('extracts URL from a markdown link', () => {
    const text = '[Example](https://example.com)';
    expect(extractMarkdownLinks(text)).toEqual(['https://example.com']);
  });

  it('extracts URLs from multiple markdown links', () => {
    const text = '[Foo](/articles/foo/) and [Bar](https://bar.com)';
    expect(extractMarkdownLinks(text)).toEqual([
      '/articles/foo/',
      'https://bar.com',
    ]);
  });

  it('excludes image links', () => {
    const text = '![Alt text](image.png) and [Link](/path/)';
    expect(extractMarkdownLinks(text)).toEqual(['/path/']);
  });

  it('returns empty array when no markdown links exist', () => {
    expect(extractMarkdownLinks('No links here')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(extractMarkdownLinks('')).toEqual([]);
  });
});

describe('isInternalLink', () => {
  it('returns true for relative paths', () => {
    expect(isInternalLink('/articles/foo/')).toBe(true);
  });

  it('returns true for noahtigner.com URLs', () => {
    expect(isInternalLink('https://noahtigner.com/articles/chapter-1/')).toBe(
      true
    );
  });

  it('returns true for http noahtigner.com URLs', () => {
    expect(isInternalLink('http://noahtigner.com/articles/test/')).toBe(true);
  });

  it('returns false for external URLs', () => {
    expect(isInternalLink('https://example.com')).toBe(false);
  });

  it('returns false for other domains', () => {
    expect(isInternalLink('https://reactrouter.com/docs')).toBe(false);
  });

  it('returns false for anchor-only hrefs', () => {
    expect(isInternalLink('#section')).toBe(false);
  });
});

describe('normalizeToPath', () => {
  it('extracts pathname from absolute URL', () => {
    expect(normalizeToPath('https://noahtigner.com/articles/chapter-1/')).toBe(
      '/articles/chapter-1/'
    );
  });

  it('returns relative path as-is with trailing slash', () => {
    expect(normalizeToPath('/articles/foo')).toBe('/articles/foo/');
  });

  it('preserves existing trailing slash', () => {
    expect(normalizeToPath('/articles/foo/')).toBe('/articles/foo/');
  });
});

describe('extractInternalLinks', () => {
  it('extracts and deduplicates internal links from mixed content', () => {
    const content = `
Some text with <a href="https://noahtigner.com/articles/chapter-1/" target="_blank">Ch 1</a>
and a [markdown link](/articles/chapter-2/) 
and an external <a href="https://example.com">Example</a>
and [another external](https://google.com)
and <a href="https://noahtigner.com/articles/chapter-1/">duplicate</a>
    `;
    const result = extractInternalLinks(content);
    expect(result).toEqual(['/articles/chapter-1/', '/articles/chapter-2/']);
  });

  it('handles content with no links', () => {
    expect(extractInternalLinks('Just plain text')).toEqual([]);
  });

  it('handles content with only external links', () => {
    const content =
      '<a href="https://example.com">External</a> [Also external](https://google.com)';
    expect(extractInternalLinks(content)).toEqual([]);
  });

  it('normalizes absolute noahtigner.com URLs to paths', () => {
    const content = '<a href="https://noahtigner.com/articles/foo">Foo</a>';
    expect(extractInternalLinks(content)).toEqual(['/articles/foo/']);
  });
});
