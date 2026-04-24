import type { ReactNode, CSSProperties } from 'react';
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

type DividerHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const headingTags = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

export default function Divider({
  children,
  style,
  asHeading = 2,
}: {
  children: ReactNode;
  style?: CSSProperties;
  asHeading?: DividerHeadingLevel;
}) {
  const HeadingTag = headingTags[asHeading];

  return (
    <StyledDivider style={style}>
      {typeof children === 'string' ? (
        <StyledH2 as={HeadingTag}>{children}</StyledH2>
      ) : (
        children
      )}
    </StyledDivider>
  );
}
