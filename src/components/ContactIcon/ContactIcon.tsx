import { Icon, styled } from '@mui/material';
import {
  GitHub,
  YouTube,
  LinkedIn,
  EmailOutlined,
  InsertDriveFileOutlined,
} from '@mui/icons-material';

import contactItems from '../../assets/data/contactItems.json';

interface ContactIconProps {
  label: (typeof contactItems)[number]['label'];
}

const StyledIcon = styled(Icon)(({ theme }) => ({
  color: `${theme.palette.primary.main} !important`,
  fontSize: '20px',
}));

function ContactIcon({ label }: ContactIconProps) {
  switch (label) {
    case 'LinkedIn':
      return <StyledIcon as={LinkedIn} />;
    case 'Email':
      return <StyledIcon as={EmailOutlined} />;
    case 'GitHub':
      return <StyledIcon as={GitHub} />;
    case 'YouTube':
      return <StyledIcon as={YouTube} />;
    case 'Résumé':
      return <StyledIcon as={InsertDriveFileOutlined} />;
    default:
      console.error(`Unknown contact item label: ${label}`);
      return null;
  }
}

export default ContactIcon;
