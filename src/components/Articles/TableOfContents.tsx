import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import type { TocHeading } from '~/utils/shared/headings';

const TocNav = styled.nav`
  margin-top: 1rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  max-height: calc(100vh - 24rem);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-divider);
    border-radius: 3px;
  }
`;

const TocList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const TocItem = styled.li<{ depth: number; active: boolean }>`
  padding-left: ${({ depth }) => depth * 0.75}rem;

  a {
    display: block;
    padding: 0.1875rem 0.5rem;
    border-left: 2px solid
      ${({ active }) => (active ? '#d55017' : 'var(--color-divider)')};
    color: ${({ active }) =>
      active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'};
    text-decoration: none;
    transition:
      color 0.2s,
      border-color 0.2s;

    &:hover {
      color: var(--color-text-primary);
    }
  }
`;

export default function TableOfContents({
  headings,
}: {
  headings: TocHeading[];
}) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headingElementsRef = useRef<Map<string, IntersectionObserverEntry>>(
    new Map()
  );

  const getActiveHeading = useCallback(() => {
    // Find the topmost visible heading
    const entries = Array.from(headingElementsRef.current.values());
    const visible = entries.filter((e) => e.isIntersecting);

    if (visible.length > 0) {
      // Pick the one closest to the top of the viewport
      visible.sort(
        (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
      );
      return visible[0].target.id;
    }

    // If no heading is visible, find the last heading that's above the viewport
    const sorted = entries.sort(
      (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
    );
    const above = sorted.filter((e) => e.boundingClientRect.top < 0);
    if (above.length > 0) {
      return above[above.length - 1].target.id;
    }

    return '';
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const entryMap = headingElementsRef.current;

    const callback: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        entryMap.set(entry.target.id, entry);
      }
      const newActive = getActiveHeading();
      if (newActive) {
        setActiveId(newActive);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      // rootMargin accounts for the sticky header height
      rootMargin: '-64px 0px -60% 0px',
      threshold: 0,
    });

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
      entryMap.clear();
    };
  }, [headings, getActiveHeading]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <TocNav aria-label="Table of contents">
      <TocList>
        {headings.map((heading) => (
          <TocItem
            key={heading.id}
            depth={heading.level - minLevel}
            active={activeId === heading.id}
          >
            <a href={`#${heading.id}`}>{heading.text}</a>
          </TocItem>
        ))}
      </TocList>
    </TocNav>
  );
}
