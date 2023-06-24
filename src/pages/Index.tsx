import { Container, Divider, styled } from '@mui/material';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import vitestLogo from '/vitest.svg';
import Experience from '../components/Experience';
import Portfolio from '../components/Portfolio';

const FlexContainer = styled(Container)(({ theme }) => ({
  marginY: 0,
  marginX: 'auto',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

function Index() {
  return (
    <FlexContainer maxWidth="lg">
      <div style={{ textAlign: 'center' }}>
        <div>
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="logo" width={64} alt="Vite logo" />
          </a>
          <a href="https://vitest.dev/" target="_blank" rel="noreferrer">
            <img
              src={vitestLogo}
              className="logo vitest"
              width={64}
              alt="Vitest logo"
            />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img
              src={reactLogo}
              className="logo react"
              width={64}
              alt="React logo"
            />
          </a>
        </div>
        <h1>It&apos;s not you, it&apos;s me...</h1>
        <p className="read-the-docs">
          I&apos;m in the process of rebuilding my site with some fun new tools.{' '}
          <br /> Check back soon!
        </p>
      </div>
      <Divider>A Few Things I&apos;ve Built</Divider>
      <Portfolio />
      <Divider>Experience</Divider>
      <Experience />
    </FlexContainer>
  );
}

export default Index;
