import type { ComponentProps } from 'react';
import styled from '@emotion/styled';

const StyledButton = styled.button`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 3px 9px;
  margin: 0;
  outline: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-black);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: var(--color-text-primary);
  user-select: none;

  background-position: center;
  transition: background 0.75s;

  @media (hover: hover) {
    &:hover {
      cursor: pointer;
      border-color: var(--color-text-primary);
      background: var(--color-gray-100)
        radial-gradient(circle, transparent 1%, var(--color-gray-100) 1%)
        center/15000%;
    }
  }

  &:active {
    border-color: var(--color-text-primary);
    background-color: var(--color-ripple);
    background-size: 100%;
    transition: background 0s;
  }

  &[data-popup-open] {
    cursor: auto;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -1px;
  }
`;

export default function Button(props: ComponentProps<'button'>) {
  return <StyledButton {...props} />;
}
