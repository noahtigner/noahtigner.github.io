import styled from '@emotion/styled';

const Box = styled.span<{ $checked: boolean; $indeterminate: boolean }>`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  border: 2px solid
    ${({ $checked, $indeterminate }) =>
      $checked || $indeterminate
        ? 'var(--color-focus)'
        : 'var(--color-border-dark)'};
  border-radius: 3px;
  background-color: ${({ $checked, $indeterminate }) =>
    $checked || $indeterminate ? 'var(--color-focus)' : 'transparent'};
  transition:
    border-color 0.15s,
    background-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    display: ${({ $checked, $indeterminate }) =>
      $checked || $indeterminate ? 'block' : 'none'};
    width: 12px;
    height: 12px;
    background-image: ${({ $indeterminate }) =>
      $indeterminate
        ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='%23141414' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='3' y='7' width='10' height='2' rx='1'/%3E%3C/svg%3E")`
        : `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='%23141414' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z'/%3E%3C/svg%3E")`};
    background-size: contain;
  }
`;

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
}

export default function Checkbox({
  checked,
  indeterminate = false,
}: CheckboxProps) {
  return (
    <Box
      $checked={checked}
      $indeterminate={!checked && indeterminate}
      aria-hidden="true"
    />
  );
}
