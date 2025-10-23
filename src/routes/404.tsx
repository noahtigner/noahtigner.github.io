import { Separator } from '@base-ui-components/react';
import styled from '@emotion/styled';

const StyledSeparator = styled(Separator)`
  width: 1px;
  height: 2rem;
  background-color: var(--color-divider);
`;

export default function NotFoundRoute() {
  return (
    <span
      style={{
        flexGrow: 1,
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>404</h2>
        <StyledSeparator orientation="vertical" />
        <p style={{ fontSize: '1.5rem' }}>
          The requested page could not be found
        </p>
      </span>
    </span>
  );
}
