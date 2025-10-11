import { Link as RouterLink } from 'react-router';
import { Container, Link, styled } from '@mui/material';
import Experience from '../components/Experience';
import Portfolio from '../components/Portfolio';
import DividerWithText from '../components/DividerWithText';
import paths from '../paths';

const FlexContainer = styled(Container)(({ theme }) => ({
  marginBottom: 0,
  marginX: 'auto',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

export default function Home() {
  return (
    <FlexContainer maxWidth="lg">
      <DividerWithText>A Few Things I&apos;ve Built</DividerWithText>
      <Portfolio />
      <DividerWithText>Experience</DividerWithText>
      <Experience />
      <Link component={RouterLink} to={paths.articles}>
        Articles
      </Link>
    </FlexContainer>
  );
}
