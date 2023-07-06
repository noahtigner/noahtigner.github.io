import {
  Stack,
  Box,
  useTheme,
  Button,
  Typography,
  styled,
  useMediaQuery,
} from '@mui/material';
import contactItems from '../../assets/data/contactItems.json';
import ContactIcon from '../ContactIcon';

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <FooterWrapper>
      <Stack
        direction="row"
        justifyContent={{ xs: 'center', sm: 'space-between' }}
        alignItems="center"
        spacing={1}
      >
        {!isMobile && (
          <Typography
            variant="body2"
            color="text.secondary"
            fontSize={{ xs: '12px', sm: '14px' }}
          >
            Built with TypeScript & React
          </Typography>
        )}
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={{ xs: 4, sm: 1 }}
        >
          {contactItems.map(({ label, url }) => (
            <Button
              key={url}
              aria-label={label}
              color="primary"
              variant="outlined"
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                padding: theme.spacing(0.5),
                margin: 0,
                minWidth: 0,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': { transform: 'scale(1.075)' },
              }}
            >
              <ContactIcon label={label} />
            </Button>
          ))}
        </Stack>
      </Stack>
    </FooterWrapper>
  );
}

export default Footer;
