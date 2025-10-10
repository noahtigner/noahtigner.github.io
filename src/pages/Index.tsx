import { type ReactNode } from 'react';
import { Container, Divider, styled, Typography } from '@mui/material';
import Experience from '../components/Experience';
import Portfolio from '../components/Portfolio';

const FlexContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: 0,
  marginX: 'auto',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

function DividerWithText({ children }: { children: ReactNode }) {
  return (
    <Divider>
      <Typography variant="h2" sx={{ fontSize: '1.25rem' }}>
        {children}
      </Typography>
    </Divider>
  );
}

function Index() {
  return (
    <FlexContainer maxWidth="lg">
      <DividerWithText>A Few Things I&apos;ve Built</DividerWithText>
      <Portfolio />
      <DividerWithText>Experience</DividerWithText>
      <Experience />
    </FlexContainer>
  );
}

export default Index;
