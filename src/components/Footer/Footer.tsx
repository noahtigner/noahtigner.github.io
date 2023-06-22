import {
  Stack,
  Box,
  useTheme,
  Button,
  Typography,
  styled,
} from '@mui/material';
import contactItems from '../../data/contactItems.json';
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
  return (
    <FooterWrapper>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          fontSize={{ xs: '12px', sm: '14px' }}
        >
          Built with TypeScript & React
        </Typography>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={{ xs: 0.5, sm: 1, md: 2 }}
        >
          {contactItems.map(({ label, url }) => (
            <Button
              key={url}
              aria-label={label}
              color="primary"
              variant="outlined"
              size="small"
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ padding: theme.spacing(0.25), margin: 0, minWidth: 0 }}
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
