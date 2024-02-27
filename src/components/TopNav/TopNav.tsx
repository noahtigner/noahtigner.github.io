import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import ContactDropdown from './ContactDropdown';

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: 'inherit',
  fontWeight: 300,
  fontSize: '1.25rem',
  [theme.breakpoints.down('md')]: {
    fontSize: '1rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  },
}));

function Heading({ children }: { children: string }) {
  return <StyledTypography variant="h1">{children}</StyledTypography>;
}

export default function TopNav() {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: theme.palette.background.paper,
        paddingX: theme.spacing(2),
        paddingY: theme.spacing(1),
        minHeight: '32px',
        boxShadow: theme.shadows[1],
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        justifyItems="center"
        justifySelf="center"
        spacing={2}
      >
        <Heading>Hey, I&apos;m Noah Tigner</Heading>
        <Button
          id="contact-button"
          variant="outlined"
          color="primary"
          size="small"
          aria-controls={anchorEl ? 'contact-menu' : undefined}
          aria-haspopup
          aria-expanded={!!anchorEl}
          onClick={handleClick}
        >
          Get In Touch
        </Button>
        <ContactDropdown anchorEl={anchorEl} onClose={handleClose} />
      </Stack>
    </Box>
  );
}
