import { useState, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import type { Question } from '~/utils/shared/flashcards';

const QuestionText = styled.h3`
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.6;
  margin: 0 0 1.5rem;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 1.5rem;
`;

const OptionLabel = styled.label<{
  $state: 'default' | 'correct' | 'incorrect' | 'missed';
}>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  border: 1px solid
    ${({ $state }) => {
      switch ($state) {
        case 'correct':
          return '#4caf50';
        case 'incorrect':
          return '#f44336';
        case 'missed':
          return '#4caf5080';
        default:
          return 'var(--color-border-card)';
      }
    }};
  background-color: ${({ $state }) => {
    switch ($state) {
      case 'correct':
        return 'rgba(76, 175, 80, 0.1)';
      case 'incorrect':
        return 'rgba(244, 67, 54, 0.1)';
      case 'missed':
        return 'rgba(76, 175, 80, 0.05)';
      default:
        return 'var(--color-paper)';
    }
  }};
  cursor: ${({ $state }) => ($state === 'default' ? 'pointer' : 'default')};
  transition:
    border-color 0.2s,
    background-color 0.2s;

  &:hover {
    ${({ $state }) =>
      $state === 'default' && 'border-color: var(--color-border);'}
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`;

const CustomIndicator = styled.span<{
  $checked: boolean;
  $type: 'radio' | 'checkbox';
}>`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border: 2px solid
    ${({ $checked }) =>
      $checked ? 'var(--color-focus)' : 'var(--color-border-dark)'};
  border-radius: ${({ $type }) => ($type === 'radio' ? '50%' : '3px')};
  background-color: ${({ $checked }) =>
    $checked ? 'var(--color-focus)' : 'transparent'};
  transition:
    border-color 0.15s,
    background-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    display: ${({ $checked }) => ($checked ? 'block' : 'none')};
    ${({ $type }) =>
      $type === 'radio'
        ? `
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--color-black);
    `
        : `
      width: 10px;
      height: 10px;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='%23141414' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z'/%3E%3C/svg%3E");
      background-size: contain;
    `}
  }
`;

const OptionText = styled.span`
  font-size: 0.9375rem;
  line-height: 1.5;
`;

const SubmitButton = styled.button`
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

const Explanation = styled.div`
  padding: 0.75rem 1rem;
  border-left: 3px solid var(--color-focus);
  background-color: var(--color-paper);
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  margin-bottom: 1.5rem;
`;

const ExplanationText = styled.p`
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

interface QuizQuestionProps {
  question: Question;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
}

export default function QuizQuestion({
  question,
  onAnswer,
  onNext,
}: QuizQuestionProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const correctAnswers = useMemo(
    () =>
      new Set(
        Array.isArray(question.answer) ? question.answer : [question.answer]
      ),
    [question.answer]
  );

  const handleSelect = useCallback(
    (index: number) => {
      if (submitted) return;
      setSelected((prev) => {
        if (question.multiSelect) {
          const next = new Set(prev);
          if (next.has(index)) {
            next.delete(index);
          } else {
            next.add(index);
          }
          return next;
        }
        return new Set([index]);
      });
    },
    [submitted, question.multiSelect]
  );

  const handleSubmit = useCallback(() => {
    if (selected.size === 0 || submitted) return;
    const isCorrect =
      selected.size === correctAnswers.size &&
      [...selected].every((s) => correctAnswers.has(s));
    setSubmitted(true);
    onAnswer(isCorrect);
  }, [selected, submitted, correctAnswers, onAnswer]);

  const handleNext = useCallback(() => {
    setSelected(new Set());
    setSubmitted(false);
    onNext();
  }, [onNext]);

  const getOptionState = (
    index: number
  ): 'default' | 'correct' | 'incorrect' | 'missed' => {
    if (!submitted) return 'default';
    const isCorrectOption = correctAnswers.has(index);
    const isSelected = selected.has(index);
    if (isSelected && isCorrectOption) return 'correct';
    if (isSelected && !isCorrectOption) return 'incorrect';
    if (!isSelected && isCorrectOption) return 'missed';
    return 'default';
  };

  const inputType = question.multiSelect ? 'checkbox' : 'radio';

  return (
    <div>
      <QuestionText>{question.question}</QuestionText>
      <OptionsList role="group" aria-label="Answer options">
        {question.options.map((option, index) => {
          const state = getOptionState(index);
          return (
            <OptionLabel
              key={index}
              $state={state}
              onClick={() => handleSelect(index)}
            >
              <HiddenInput
                type={inputType}
                name={`question-${question.id}`}
                checked={selected.has(index)}
                onChange={() => handleSelect(index)}
                disabled={submitted}
                aria-label={option}
              />
              <CustomIndicator
                $checked={selected.has(index)}
                $type={inputType}
              />
              <OptionText>{option}</OptionText>
            </OptionLabel>
          );
        })}
      </OptionsList>
      {submitted && (
        <Explanation>
          <ExplanationText>{question.explanation}</ExplanationText>
        </Explanation>
      )}
      <ButtonRow>
        {!submitted ? (
          <SubmitButton
            onClick={handleSubmit}
            disabled={selected.size === 0}
            type="button"
          >
            Submit
          </SubmitButton>
        ) : (
          <SubmitButton onClick={handleNext} type="button">
            Next
          </SubmitButton>
        )}
      </ButtonRow>
    </div>
  );
}
