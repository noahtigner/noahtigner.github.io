import {
  Stack,
  Box,
  useTheme,
  Button,
  Typography,
  styled,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import contactItems from '../../assets/data/contactItems.json';
import ContactIcon from '../ContactIcon';

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(4),
  marginLeft: theme.spacing(4),
  marginRight: theme.spacing(4),
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <FooterWrapper as="footer">
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
            <Tooltip key={url} title={label} arrow>
              <Button
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
            </Tooltip>
          ))}
        </Stack>
      </Stack>
    </FooterWrapper>
  );
}

export default Footer;
