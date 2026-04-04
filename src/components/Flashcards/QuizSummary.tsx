import styled from '@emotion/styled';
import { LinkInternal } from '~/components/Button';
import type { Deck } from '~/utils/shared/flashcards';

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 0;
`;

const ScoreDisplay = styled.div`
  text-align: center;
`;

const ScoreValue = styled.div`
  font-size: 3rem;
  font-weight: 300;
  line-height: 1.2;
  color: var(--color-text-primary);
`;

const ScoreLabel = styled.p`
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
`;

const ScoreBar = styled.div`
  width: 100%;
  max-width: 300px;
  height: 6px;
  background-color: var(--color-divider);
  border-radius: 3px;
  overflow: hidden;
`;

const ScoreBarFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background-color: var(--color-focus);
  border-radius: 3px;
  transition: width 0.5s ease;
`;

const BestScoreText = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionButton = styled.button`
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

  &:hover {
    border-color: var(--color-text-primary);
    background-color: var(--color-gray-100);
  }

  &:active {
    background-color: var(--color-ripple);
    transition: background 0s;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -1px;
  }
`;

const RelatedLinks = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
`;

const RelatedLabel = styled.p`
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
`;

interface QuizSummaryProps {
  score: number;
  total: number;
  bestScore: number | null;
  decks: Deck[];
  onRetry: () => void;
  onExit?: () => void;
}

export default function QuizSummary({
  score,
  total,
  bestScore,
  decks,
  onRetry,
  onExit,
}: QuizSummaryProps) {
  const percent = Math.round((score / total) * 100);

  const allRelatedArticles = [
    ...new Set(decks.flatMap((d) => d.relatedArticles)),
  ];

  return (
    <SummaryContainer>
      <ScoreDisplay>
        <ScoreValue>
          {score} / {total}
        </ScoreValue>
        <ScoreLabel>{percent}% correct</ScoreLabel>
      </ScoreDisplay>
      <ScoreBar>
        <ScoreBarFill $percent={percent} />
      </ScoreBar>
      {bestScore !== null && (
        <BestScoreText>
          Personal best: {bestScore} / {total}
        </BestScoreText>
      )}
      <ButtonRow>
        <ActionButton onClick={onRetry} type="button">
          Try Again
        </ActionButton>
        {onExit ? (
          <ActionButton onClick={onExit} type="button">
            All Decks
          </ActionButton>
        ) : (
          <LinkInternal to="/flashcards/" prefetch="intent">
            All Decks
          </LinkInternal>
        )}
      </ButtonRow>
      {allRelatedArticles.length > 0 && (
        <RelatedLinks>
          <RelatedLabel>Related reading:</RelatedLabel>
          {allRelatedArticles.map((path) => (
            <LinkInternal key={path} to={path} prefetch="intent">
              {path}
            </LinkInternal>
          ))}
        </RelatedLinks>
      )}
    </SummaryContainer>
  );
}
