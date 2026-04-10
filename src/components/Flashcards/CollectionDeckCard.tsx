import { useId, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { ChevronDown } from 'lucide-react';

import Checkbox from '~/components/Flashcards/Checkbox';
import DeckCard from '~/components/Flashcards/DeckCard';
import { useDeckProgressMap } from '~/utils/shared/flashcards';
import { type DeckCollectionGroup } from '~/utils/vite/flashcards';

const CollectionCard = styled.div`
  border-bottom: 1px solid var(--color-divider);

  &:last-child {
    border-bottom: none;
  }
`;

const CollectionRow = styled.div<{ $selected: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-left: 3px solid
    ${({ $selected }) => ($selected ? 'var(--color-focus)' : 'transparent')};
  padding-left: calc(1rem - 3px);
  transition: border-color 0.15s;
  cursor: pointer;
  user-select: none;

  &:hover h3 {
    text-decoration: underline;
    text-decoration-color: var(--color-ripple);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -1px;
  }
`;

const Thumbnail = styled.img`
  width: 72px;
  height: 72px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: var(--border-radius);
  background-color: var(--color-paper);

  @media (max-width: 480px) {
    display: none;
  }
`;

const CollectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
`;

const CollectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  line-height: 1.4;
`;

const CollectionMeta = styled.p`
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0;
`;

const CollectionDescription = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
`;

const ProgressIndicator = styled.span`
  font-size: 0.8125rem;
  color: var(--color-focus);
`;

const Chevron = styled(ChevronDown)<{ $expanded: boolean }>`
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transform: rotate(${({ $expanded }) => ($expanded ? '0deg' : '-90deg')});
  transition: transform 0.15s;
`;

const ExpandButton = styled.button`
  flex-shrink: 0;
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
`;

const NestedDecks = styled.div`
  padding-left: 2.5rem;

  @media (max-width: 480px) {
    padding-left: 0;
  }
`;

interface CollectionDeckCardProps {
  group: DeckCollectionGroup;
  selectedSlugs: Set<string>;
  onToggleDeck: (slug: string) => void;
  onToggleCollection: (slugs: string[]) => void;
}

export default function CollectionDeckCard({
  group,
  selectedSlugs,
  onToggleDeck,
  onToggleCollection,
}: CollectionDeckCardProps) {
  const [expanded, setExpanded] = useState(false);
  const checkboxId = useId();
  const progressByDeck = useDeckProgressMap(
    group.decks.map((deck) => deck.slug)
  );
  const selectedCount = group.decks.filter((deck) =>
    selectedSlugs.has(deck.slug)
  ).length;
  const allSelected = selectedCount === group.decks.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const totalQuestions = group.decks.reduce(
    (sum, deck) => sum + deck.questions.length,
    0
  );
  const aggregateProgress = useMemo(() => {
    let bestScore = 0;
    let progressQuestions = 0;

    for (const deck of group.decks) {
      const progress = progressByDeck[deck.slug];
      if (!progress) continue;

      bestScore += progress.bestScore;
      progressQuestions += progress.totalQuestions;
    }

    if (progressQuestions === 0) return null;

    return { bestScore, totalQuestions: progressQuestions };
  }, [group.decks, progressByDeck]);
  const contentId = `${checkboxId}-content`;
  const toggleCollectionSelection = () => {
    onToggleCollection(group.decks.map((deck) => deck.slug));
  };

  return (
    <CollectionCard>
      <CollectionRow
        $selected={someSelected || allSelected}
        role="checkbox"
        aria-label={`Select all decks in ${group.title}`}
        aria-checked={someSelected ? 'mixed' : allSelected}
        tabIndex={0}
        onClick={toggleCollectionSelection}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            toggleCollectionSelection();
          }
        }}
      >
        <Checkbox checked={allSelected} indeterminate={someSelected} />
        <Thumbnail src={group.image} alt="" aria-hidden="true" />
        <CollectionInfo>
          <CollectionTitle>{group.title}</CollectionTitle>
          <CollectionMeta>
            {group.decks.length} deck{group.decks.length !== 1 && 's'} •{' '}
            {totalQuestions} question{totalQuestions !== 1 && 's'}
            {aggregateProgress && (
              <>
                {' '}
                <ProgressIndicator>
                  Best: {aggregateProgress.bestScore}/
                  {aggregateProgress.totalQuestions}
                </ProgressIndicator>
              </>
            )}
          </CollectionMeta>
          <CollectionDescription>
            Expand to pick individual chapters.
          </CollectionDescription>
        </CollectionInfo>
        <ExpandButton
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          aria-expanded={expanded}
          aria-controls={contentId}
          aria-label={
            expanded ? `Collapse ${group.title}` : `Expand ${group.title}`
          }
        >
          <Chevron $expanded={expanded} />
        </ExpandButton>
      </CollectionRow>
      {expanded && (
        <NestedDecks id={contentId}>
          {group.decks.map((deck) => (
            <DeckCard
              key={deck.slug}
              {...deck}
              selectable
              selected={selectedSlugs.has(deck.slug)}
              onToggle={() => onToggleDeck(deck.slug)}
            />
          ))}
        </NestedDecks>
      )}
    </CollectionCard>
  );
}
