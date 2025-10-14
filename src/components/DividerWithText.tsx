import { type ReactNode } from 'react';
import { Divider, Typography } from '@mui/material';

export default function DividerWithText({ children }: { children: ReactNode }) {
  return (
    <Divider component="div" role="presentation">
      <Typography variant="h2" sx={{ fontSize: '1.25rem' }}>
        {children}
      </Typography>
    </Divider>
  );
}
