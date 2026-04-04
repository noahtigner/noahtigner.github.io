import { useState, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';

import QuizQuestion from '~/components/Flashcards/QuizQuestion';
import QuizProgress from '~/components/Flashcards/QuizProgress';
import QuizSummary from '~/components/Flashcards/QuizSummary';
import {
  shuffleArray,
  saveProgress,
  getProgress,
  type Deck,
  type Question,
} from '~/utils/shared/flashcards';

const QuizCard = styled.div`
  background-color: var(--color-paper);
  border: 1px solid var(--color-border-card);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
`;

interface QuizSessionProps {
  decks: Deck[];
  /** Called when user clicks "All Decks" from the summary. If omitted, a Link is rendered instead. */
  onExit?: () => void;
  /** Stable key to force a fresh session (e.g. when deck selection changes). */
  sessionKey?: string;
  /** Limit the number of questions. If omitted, all questions are used. */
  questionLimit?: number;
}

export default function QuizSession({
  decks,
  onExit,
  sessionKey,
  questionLimit,
}: QuizSessionProps) {
  const shuffledQuestions = useMemo(() => {
    const all: Question[] = decks.flatMap((d) => d.questions);
    const shuffled = shuffleArray(all);
    return questionLimit != null ? shuffled.slice(0, questionLimit) : shuffled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, decks, questionLimit]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  const handleAnswer = useCallback((correct: boolean) => {
    if (correct) {
      setScore((prev) => prev + 1);
    }
    setAnsweredCount((prev) => prev + 1);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= shuffledQuestions.length) {
      // Save progress per-deck so individual deck cards show accurate stats
      for (const deck of decks) {
        saveProgress(deck.slug, score, shuffledQuestions.length);
      }
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, shuffledQuestions.length, score, decks]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setAnsweredCount(0);
  }, []);

  const bestScore = useMemo(() => {
    // For single-deck, show per-deck best. For multi-deck, no stored best.
    if (decks.length === 1) {
      return getProgress(decks[0].slug)?.bestScore ?? null;
    }
    return null;
  }, [decks]);

  return (
    <QuizCard>
      {finished ? (
        <QuizSummary
          score={score}
          total={shuffledQuestions.length}
          bestScore={bestScore}
          decks={decks}
          onRetry={handleRetry}
          onExit={onExit}
        />
      ) : (
        <>
          <QuizProgress
            current={answeredCount}
            total={shuffledQuestions.length}
            score={score}
          />
          <QuizQuestion
            key={shuffledQuestions[currentIndex].id}
            question={shuffledQuestions[currentIndex]}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        </>
      )}
    </QuizCard>
  );
}
