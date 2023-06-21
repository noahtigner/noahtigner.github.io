import { GitHub, YouTube, LinkedIn, Email } from '@mui/icons-material';

import contactItems from '../../data/contactItems.json';

interface ContactIconProps {
  label: (typeof contactItems)[number]['label'];
}

function ContactIcon({ label }: ContactIconProps) {
  switch (label) {
    case 'LinkedIn':
      return <LinkedIn fontSize="small" />;
    case 'Email':
      return <Email fontSize="small" />;
    case 'GitHub':
      return <GitHub fontSize="small" />;
    case 'YouTube':
      return <YouTube fontSize="small" />;
    default:
      throw new Error(`Unknown contact item label: ${label}`);
  }
}

export default ContactIcon;
