import GitHubIcon from '@mui/icons-material/GitHub';
import YoutubeIcon from '@mui/icons-material/Youtube';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';

import contactItems from '../../data/contactItems.json';

interface ContactIconProps {
  label: (typeof contactItems)[number]['label'];
}

function ContactIcon({ label }: ContactIconProps) {
  switch (label) {
    case 'LinkedIn':
      return <LinkedInIcon fontSize="small" />;
    case 'Email':
      return <EmailIcon fontSize="small" />;
    case 'GitHub':
      return <GitHubIcon fontSize="small" />;
    case 'YouTube':
      return <YoutubeIcon fontSize="small" />;
    default:
      throw new Error(`Unknown contact item label: ${label}`);
  }
}

export default ContactIcon;
