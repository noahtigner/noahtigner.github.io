import { ThemeProvider, createTheme } from '@mui/material';
import Index from './pages/Index';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#202020',
      paper: '#242424',
    },
    text: {
      primary: '#E6F0E6',
      secondary: '#969696',
    },
    primary: {
      main: '#1976D0',
    },
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
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Index />
    </ThemeProvider>
  );
}

export default App;
