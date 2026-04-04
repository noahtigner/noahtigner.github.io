import { useState, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import MetaTags from '~/components/MetaTags';
import { paths } from '~/routes';
import Divider from '~/components/Divider';
import { LinkInternal } from '~/components/Button';
import DeckCard from '~/components/Flashcards/DeckCard';
import CollectionDeckCard from '~/components/Flashcards/CollectionDeckCard';
import QuizSession from '~/components/Flashcards/QuizSession';
import {
  clearAllProgress,
  useDeckProgressMap,
} from '~/utils/shared/flashcards';
import { allDecks, interleaveDecks } from '~/utils/vite/flashcards';

const PageContainer = styled.div`
  width: 100%;
  max-width: var(--size-md);
  margin-left: auto;
  margin-right: auto;
`;

const DeckList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
`;

const SelectionFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const SliderGroup = styled.div<{ $disabled: boolean }>`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  transition: opacity 0.15s;
`;

const SliderLabel = styled.label`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  user-select: none;
`;

const Slider = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: var(--color-divider);
  border-radius: 3px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-focus);
    border: none;
    cursor: pointer;
    transition: box-shadow 0.15s;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-focus);
    border: none;
    cursor: pointer;
  }

  &:focus-visible::-webkit-slider-thumb {
    box-shadow:
      0 0 0 3px var(--color-black),
      0 0 0 5px var(--color-focus);
  }

  &:focus-visible::-moz-range-thumb {
    box-shadow:
      0 0 0 3px var(--color-black),
      0 0 0 5px var(--color-focus);
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }

  &:disabled::-moz-range-thumb {
    cursor: not-allowed;
  }
`;

const StartButton = styled.button`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-black);
  font-family: inherit;
  font-size: 0.9375rem;
  line-height: 1.5rem;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background 0.75s;
  user-select: none;

  &:hover:not(:disabled) {
    border-color: var(--color-text-primary);
    background-color: var(--color-gray-100);
  }

  &:active:not(:disabled) {
    background-color: var(--color-ripple);
    transition: background 0s;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -1px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ResetButton = styled.button`
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  cursor: pointer;

  &:hover:not(:disabled) {
    color: var(--color-text-primary);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export default function Flashcards() {
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [sessionActive, setSessionActive] = useState(false);
  const [questionLimit, setQuestionLimit] = useState(0);

  const deckItems = useMemo(() => interleaveDecks(allDecks), []);
  const progressByDeck = useDeckProgressMap(allDecks.map((deck) => deck.slug));

  const toggleDeck = useCallback((slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const toggleCollection = useCallback((slugs: string[]) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      const allSelected = slugs.every((slug) => next.has(slug));

      for (const slug of slugs) {
        if (allSelected) {
          next.delete(slug);
        } else {
          next.add(slug);
        }
      }

      return next;
    });
  }, []);

  const selectedDecks = useMemo(
    () => allDecks.filter((d) => selectedSlugs.has(d.slug)),
    [selectedSlugs]
  );

  const totalQuestions = useMemo(
    () => selectedDecks.reduce((sum, d) => sum + d.questions.length, 0),
    [selectedDecks]
  );

  // Clamp questionLimit when deck selection changes.
  // Computed during render rather than in an effect to avoid cascading renders.
  const clampedLimit = useMemo(() => {
    if (totalQuestions === 0) return 0;
    if (questionLimit === 0 || questionLimit > totalQuestions)
      return totalQuestions;
    return questionLimit;
  }, [questionLimit, totalQuestions]);

  const sessionKey = useMemo(
    () => [...selectedSlugs].sort().join('+') + ':' + clampedLimit,
    [selectedSlugs, clampedLimit]
  );
  const hasSelection = selectedSlugs.size > 0;
  const hasAnyProgress = Object.values(progressByDeck).some(Boolean);
  const sliderMin = hasSelection ? 1 : 0;
  const sliderMax = totalQuestions > 0 ? totalQuestions : 1;

  const handleStartSession = useCallback(() => {
    setSessionActive(true);
  }, []);

  const handleExitSession = useCallback(() => {
    setSessionActive(false);
  }, []);

  const handleResetProgress = useCallback(() => {
    if (
      !window.confirm('Reset all flashcard progress? This cannot be undone.')
    ) {
      return;
    }

    clearAllProgress();
  }, []);

  if (sessionActive && selectedDecks.length > 0) {
    return (
      <PageContainer>
        <MetaTags
          title="Flashcards - Noah Tigner"
          description="Test your knowledge with interactive quiz decks on database internals, web fundamentals, and more."
        />
        <Divider>
          {selectedDecks.length === 1
            ? selectedDecks[0].title
            : `${selectedDecks.length} Decks`}
        </Divider>
        <QuizSession
          decks={selectedDecks}
          onExit={handleExitSession}
          sessionKey={sessionKey}
          questionLimit={clampedLimit}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <MetaTags
        title="Flashcards - Noah Tigner"
        description="Test your knowledge with interactive quiz decks on database internals, web fundamentals, and more."
      />
      <Divider>Flashcards</Divider>
      <DeckList>
        {deckItems.map((item) =>
          item.type === 'standalone' ? (
            <DeckCard
              key={item.deck.slug}
              {...item.deck}
              selectable
              selected={selectedSlugs.has(item.deck.slug)}
              onToggle={() => toggleDeck(item.deck.slug)}
            />
          ) : (
            <CollectionDeckCard
              key={item.group.slug}
              group={item.group}
              selectedSlugs={selectedSlugs}
              onToggleDeck={toggleDeck}
              onToggleCollection={toggleCollection}
            />
          )
        )}
      </DeckList>
      <SelectionFooter>
        <SliderGroup $disabled={!hasSelection}>
          <SliderLabel htmlFor="question-limit">
            {clampedLimit} / {totalQuestions} question
            {totalQuestions !== 1 && 's'}
          </SliderLabel>
          <Slider
            id="question-limit"
            type="range"
            min={sliderMin}
            max={sliderMax}
            value={hasSelection ? clampedLimit : 0}
            onChange={(e) => setQuestionLimit(Number(e.target.value))}
            disabled={!hasSelection}
          />
        </SliderGroup>
        <StartButton
          onClick={handleStartSession}
          disabled={!hasSelection}
          type="button"
        >
          Start Session
        </StartButton>
        <ResetButton
          type="button"
          onClick={handleResetProgress}
          disabled={!hasAnyProgress}
        >
          Reset All Progress
        </ResetButton>
      </SelectionFooter>
      <LinkInternal
        to={paths.home}
        prefetch="intent"
        style={{
          width: 'fit-content',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '32px',
        }}
      >
        &lt; Back Home
      </LinkInternal>
    </PageContainer>
  );
}
