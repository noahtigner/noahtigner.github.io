import { Container, ThemeProvider, createTheme } from '@mui/material';
import Index from './pages/Index';
import TopNav from './components/TopNav';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#202020',
      paper: '#282828',
    },
    text: {
      primary: '#E6F0E6',
      secondary: '#969696',
    },
    primary: {
      main: '#6EDFCA',
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
          '::before': {
            borderColor: '#969696',
          },
          '::after': {
            borderColor: '#969696',
          },
          textAlign: 'center',
          fontSize: '16px',
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
      <Container maxWidth="lg">
        <TopNav />
        <Index />
      </Container>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
