import styled from '@emotion/styled';

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ProgressText = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
`;

const ProgressBarTrack = styled.div`
  flex: 1;
  height: 4px;
  background-color: var(--color-divider);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background-color: var(--color-focus);
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const ScoreText = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
`;

interface QuizProgressProps {
  current: number;
  total: number;
  score: number;
}

export default function QuizProgress({
  current,
  total,
  score,
}: QuizProgressProps) {
  const percent = (current / total) * 100;

  return (
    <ProgressContainer>
      <ProgressText>
        {current} / {total}
      </ProgressText>
      <ProgressBarTrack>
        <ProgressBarFill $percent={percent} />
      </ProgressBarTrack>
      <ScoreText>{score} correct</ScoreText>
    </ProgressContainer>
  );
}
