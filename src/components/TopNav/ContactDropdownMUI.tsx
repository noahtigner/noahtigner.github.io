import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  MenuList,
  styled,
  alpha,
  Divider,
  type MenuProps,
} from '@mui/material';
import { Link as RouterLink } from 'react-router';

import contactItems from '../../assets/data/contactItems.json';
import ContactIcon from '../ContactIcon';
import paths from '../../paths';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={4}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    marginTop: theme.spacing(1),
    '& .MuiList-root': {
      backgroundColor: theme.palette.background.paper,
    },
    '& .MuiMenu-list': {
      padding: 0,
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        color: theme.palette.text.secondary,
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
      '&:hover': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

interface ContactDropdownProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
}

function ContactDropdown({ anchorEl, onClose }: ContactDropdownProps) {
  const open = Boolean(anchorEl);

  return (
    <StyledMenu
      id="contact-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        list: {
          'aria-labelledby': 'contact-button',
        },
      }}
    >
      <MenuList>
        {contactItems.map(({ label, url }, i) => (
          <MenuItem
            key={url}
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ animation: `fadeIn ${(i + 1) * 250}ms` }}
          >
            <ListItemIcon>
              <ContactIcon label={label} />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          component={RouterLink}
          to={paths.articles}
          sx={{ animation: `fadeIn ${(contactItems.length + 1) * 250}ms` }}
        >
          <ListItemIcon>
            <ContactIcon label="Article" />
          </ListItemIcon>
          <ListItemText>Articles</ListItemText>
        </MenuItem>
      </MenuList>
    </StyledMenu>
  );
}

export default ContactDropdown;
