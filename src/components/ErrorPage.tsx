import { Separator } from '@base-ui-components/react';
import styled from '@emotion/styled';

const StyledSeparator = styled(Separator)`
  width: 1px;
  height: 2rem;
  background-color: var(--color-divider);
`;

export default function ErrorPage({
  message,
  details,
  stack,
}: {
  message: string;
  details: string;
  stack?: string;
}) {
  return (
    <>
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 300 }}>{message}</h2>
          <StyledSeparator orientation="vertical" />
          <p style={{ fontSize: '1.5rem', fontWeight: 300 }}>{details}</p>
        </span>
      </span>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </>
  );
}
