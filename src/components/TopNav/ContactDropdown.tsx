import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  MenuList,
  MenuProps,
  styled,
  alpha,
} from '@mui/material';

import contactItems from '../../assets/data/contactItems.json';
import ContactIcon from '../ContactIcon';

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
      MenuListProps={{
        'aria-labelledby': 'contact-button',
      }}
    >
      <MenuList>
        {contactItems.map(({ label, url }) => (
          <MenuItem
            key={url}
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ListItemIcon>
              <ContactIcon label={label} />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </MenuList>
    </StyledMenu>
  );
}

export default ContactDropdown;
