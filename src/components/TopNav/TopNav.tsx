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
  return <StyledTypography variant="h6">{children}</StyledTypography>;
}

export default function TopNav() {
  const theme = useTheme();
  const [contactDialogOpen, setContactDialogOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setContactDialogOpen(true);
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
        backgroundColor: theme.palette.background.default,
        paddingTop: theme.spacing(0.5),
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          marginY: theme.spacing(1),
          paddingX: theme.spacing(2),
          paddingY: theme.spacing(1),
          minHeight: '32px',
          borderRadius: '8px',
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
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleClick}
            id="contact-button"
            aria-controls={contactDialogOpen ? 'contact-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={contactDialogOpen ? 'true' : undefined}
          >
            Get in Touch
          </Button>
          <ContactDropdown anchorEl={anchorEl} onClose={handleClose} />
        </Stack>
      </Box>
    </Box>
  );
}
