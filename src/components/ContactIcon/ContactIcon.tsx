import { Icon, styled } from '@mui/material';
import { GitHub, YouTube, LinkedIn, EmailOutlined } from '@mui/icons-material';

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
    default:
      throw new Error(`Unknown contact item label: ${label}`);
  }
}

export default ContactIcon;
