import { Container, Divider, styled } from '@mui/material';
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

function Index() {
  return (
    <FlexContainer maxWidth="lg">
      <Divider>A Few Things I&apos;ve Built</Divider>
      <Portfolio />
      <Divider>Experience</Divider>
      <Experience />
    </FlexContainer>
  );
}

export default Index;
