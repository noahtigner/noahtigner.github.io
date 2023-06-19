import { ThemeProvider, createTheme } from '@mui/material';
import Index from './pages/Index';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  palette: {
    background: {
      default: 'rgb(35, 35, 35)',
    },
    text: {
      primary: 'rgb(230, 240, 230)',
      secondary: 'rgb(150, 150, 150)',
    },
  },
  components: {
    MuiDivider: {
      styleOverrides: {
        root: {
          '::before': {
            borderColor: 'rgb(150, 150, 150)',
          },
          '::after': {
            borderColor: 'rgb(150, 150, 150)',
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
      {/* <CssBaseline /> */}
      <Index />
    </ThemeProvider>
  );
}

export default App;
