import { Container, ThemeProvider, createTheme } from '@mui/material';

import Index from './pages/Index';
import TopNav from './components/TopNav';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#141414',
      paper: '#202020',
    },
    text: {
      primary: '#E6F0E6',
      secondary: '#b1b1b1ff',
    },
    primary: {
      // main: '#6EDFCA',
      main: '#b1b1b1ff',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  components: {
    MuiDivider: {
      styleOverrides: {
        root: {
          textAlign: 'center',
          fontSize: '1rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <TopNav />
      <Container maxWidth="lg" component="main">
        <Index />
      </Container>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
