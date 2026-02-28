import { describe, expect, it } from 'vitest';
import { getAllArticleAttributes } from './markdown';

const baseAttributes = {
  title: 'Test Article',
  description: 'A test article.',
  tags: ['test'],
  path: '/articles/test/',
  image: '/images/test.webp',
  published: 'January 1, 2025',
  updated: null,
  minutesToRead: 5,
};

describe('getAllArticleAttributes', () => {
  it('should parse valid attributes without a collection', () => {
    const result = getAllArticleAttributes([baseAttributes]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test Article');
    expect(result[0].collection).toBeUndefined();
  });

  it('should parse valid attributes with a collection', () => {
    const attrs = {
      ...baseAttributes,
      collection: { slug: 'my-series', title: 'My Series', order: 1 },
    };
    const result = getAllArticleAttributes([attrs]);
    expect(result).toHaveLength(1);
    expect(result[0].collection).toEqual({
      slug: 'my-series',
      title: 'My Series',
      order: 1,
    });
  });

  it('should reject attributes with a partial collection (missing order)', () => {
    const attrs = {
      ...baseAttributes,
      collection: { slug: 'my-series', title: 'My Series' },
    };
    const result = getAllArticleAttributes([attrs]);
    expect(result).toHaveLength(0);
  });

  it('should reject attributes with a partial collection (missing title)', () => {
    const attrs = {
      ...baseAttributes,
      collection: { slug: 'my-series', order: 0 },
    };
    const result = getAllArticleAttributes([attrs]);
    expect(result).toHaveLength(0);
  });

  it('should reject attributes with a partial collection (missing slug)', () => {
    const attrs = {
      ...baseAttributes,
      collection: { title: 'My Series', order: 0 },
    };
    const result = getAllArticleAttributes([attrs]);
    expect(result).toHaveLength(0);
  });

  it('should sort articles by published date descending', () => {
    const older = { ...baseAttributes, published: 'January 1, 2024' };
    const newer = {
      ...baseAttributes,
      path: '/articles/newer/',
      published: 'June 1, 2025',
    };
    const result = getAllArticleAttributes([older, newer]);
    expect(result[0].published).toBe('June 1, 2025');
    expect(result[1].published).toBe('January 1, 2024');
  });

  it('should filter out invalid attributes', () => {
    const invalid = { title: 'Only Title' };
    const result = getAllArticleAttributes([baseAttributes, invalid]);
    expect(result).toHaveLength(1);
  });
});
