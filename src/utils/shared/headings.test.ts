import { describe, expect, it } from 'vitest';
import { extractHeadings } from './headings';

describe('extractHeadings', () => {
  it('should extract h2, h3, h4 headings with IDs', () => {
    const html = `
      <h2 id="intro"><a class="header-anchor" href="#intro">Introduction</a></h2>
      <p>Some text</p>
      <h3 id="sub-section"><a class="header-anchor" href="#sub-section">Sub Section</a></h3>
      <h4 id="detail"><a class="header-anchor" href="#detail">Detail</a></h4>
    `;
    const headings = extractHeadings(html);
    expect(headings).toEqual([
      { id: 'intro', text: 'Introduction', level: 2 },
      { id: 'sub-section', text: 'Sub Section', level: 3 },
      { id: 'detail', text: 'Detail', level: 4 },
    ]);
  });

  it('should return empty array for HTML without headings', () => {
    const html = '<p>No headings here</p>';
    expect(extractHeadings(html)).toEqual([]);
  });

  it('should skip headings without IDs', () => {
    const html = `
      <h2>No ID</h2>
      <h3 id="has-id"><a href="#has-id">Has ID</a></h3>
    `;
    const headings = extractHeadings(html);
    expect(headings).toEqual([{ id: 'has-id', text: 'Has ID', level: 3 }]);
  });

  it('should strip nested HTML tags from heading text', () => {
    const html = `
      <h2 id="styled"><a class="header-anchor" href="#styled"><strong>Bold</strong> and <em>italic</em></a></h2>
    `;
    const headings = extractHeadings(html);
    expect(headings).toEqual([
      { id: 'styled', text: 'Bold and italic', level: 2 },
    ]);
  });

  it('should handle multiple h2 headings', () => {
    const html = `
      <h2 id="first"><a href="#first">First</a></h2>
      <h2 id="second"><a href="#second">Second</a></h2>
      <h2 id="third"><a href="#third">Third</a></h2>
    `;
    const headings = extractHeadings(html);
    expect(headings).toHaveLength(3);
    expect(headings.map((h) => h.id)).toEqual(['first', 'second', 'third']);
  });

  it('should not extract h1 or h5+ headings', () => {
    const html = `
      <h1 id="title">Title</h1>
      <h2 id="intro">Intro</h2>
      <h5 id="deep">Deep</h5>
      <h6 id="deeper">Deeper</h6>
    `;
    const headings = extractHeadings(html);
    expect(headings).toEqual([{ id: 'intro', text: 'Intro', level: 2 }]);
  });

  it('should return empty array for empty string', () => {
    expect(extractHeadings('')).toEqual([]);
  });

  it('should decode HTML entities in heading text', () => {
    const html = `
      <h2 id="intro-motivation"><a class="header-anchor" href="#intro-motivation">Introduction &amp; Motivation</a></h2>
      <h3 id="read-write"><a class="header-anchor" href="#read-write">Read &amp; Write Anomalies</a></h3>
      <h4 id="angles"><a class="header-anchor" href="#angles">&lt;Component /&gt;</a></h4>
    `;
    const headings = extractHeadings(html);
    expect(headings).toEqual([
      { id: 'intro-motivation', text: 'Introduction & Motivation', level: 2 },
      { id: 'read-write', text: 'Read & Write Anomalies', level: 3 },
      { id: 'angles', text: '<Component />', level: 4 },
    ]);
  });
});
