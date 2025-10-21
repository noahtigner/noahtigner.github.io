import type { ReactNode } from 'react';
import styled from '@emotion/styled';

const StyledDivider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--color-divider);
    border: none;
  }
`;

const StyledH2 = styled.h2`
  white-space: nowrap;
  flex-shrink: 0;
  padding: 0 0.75rem;
`;

export default function Divider({ children }: { children: ReactNode }) {
  return (
    <StyledDivider role="presentation">
      {typeof children === 'string' ? (
        <StyledH2>{children}</StyledH2>
      ) : (
        children
      )}
    </StyledDivider>
  );
}
