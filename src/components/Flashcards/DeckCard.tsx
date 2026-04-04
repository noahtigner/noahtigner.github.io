import styled from '@emotion/styled';
import { LinkInternal } from '~/components/Button';
import Checkbox from '~/components/Flashcards/Checkbox';
import { useDeckProgress, type Deck } from '~/utils/shared/flashcards';

const sharedRowStyles = `
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  color: inherit;
  border-bottom: 1px solid var(--color-divider);

  &:last-child {
    border-bottom: none;
  }

  &:hover h3 {
    text-decoration: underline;
    text-decoration-color: var(--color-ripple);
  }
`;

const DeckLinkRow = styled(LinkInternal)`
  ${sharedRowStyles}
  text-decoration: none !important;
`;

const DeckSelectableRow = styled.div<{ $selected: boolean }>`
  ${sharedRowStyles}
  cursor: pointer;
  user-select: none;
  border-left: 3px solid
    ${({ $selected }) => ($selected ? 'var(--color-focus)' : 'transparent')};
  padding-left: calc(1rem - 3px);
  transition: border-color 0.15s;

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

const DeckInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
`;

const DeckTitle = styled.h3`
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  line-height: 1.4;
`;

const DeckMeta = styled.p`
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0;
`;

const DeckDescription = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProgressIndicator = styled.span`
  font-size: 0.8125rem;
  color: var(--color-focus);
`;

type DeckCardProps = Deck &
  (
    | { selectable?: false; selected?: never; onToggle?: never }
    | { selectable: true; selected: boolean; onToggle: () => void }
  );

export default function DeckCard({
  slug,
  title,
  description,
  image,
  questions,
  selectable,
  selected,
  onToggle,
}: DeckCardProps) {
  const progress = useDeckProgress(slug);

  const content = (
    <>
      {selectable && <Checkbox checked={!!selected} />}
      <Thumbnail src={image} alt="" aria-hidden="true" />
      <DeckInfo>
        <DeckTitle>{title}</DeckTitle>
        <DeckMeta>
          {questions.length} question{questions.length !== 1 && 's'}
          {progress && (
            <>
              {' '}
              <ProgressIndicator>
                Best: {progress.bestScore}/{progress.totalQuestions}
              </ProgressIndicator>
            </>
          )}
        </DeckMeta>
        <DeckDescription>{description}</DeckDescription>
      </DeckInfo>
    </>
  );

  if (selectable) {
    return (
      <DeckSelectableRow
        $selected={!!selected}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            onToggle();
          }
        }}
        role="checkbox"
        aria-checked={!!selected}
        aria-label={title}
        tabIndex={0}
      >
        {content}
      </DeckSelectableRow>
    );
  }

  return (
    <DeckLinkRow
      to={`/flashcards/${slug}/`}
      prefetch="viewport"
      aria-label={title}
    >
      {content}
    </DeckLinkRow>
  );
}
