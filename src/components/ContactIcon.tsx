import { Mail, FileText, Newspaper } from 'lucide-react';
import styled from '@emotion/styled';

import NpmSvg from '~/assets/icons/npm.svg?react';
import GitHubSvg from '~/assets/icons/github.svg?react';
import LinkedInSvg from '~/assets/icons/linkedin.svg?react';
import YouTubeSvg from '~/assets/icons/youtube.svg?react';
import contactItems from '~/assets/data/contactItems.json';

interface ContactIconProps {
  label: (typeof contactItems)[number]['label'];
}

const StyledSvg = styled.svg`
  color: var(--color-text-primary);
  width: 20px;
  height: 20px;
`;

const iconProps = { size: 20, color: 'var(--color-text-primary)' };

function ContactIcon({ label }: ContactIconProps) {
  switch (label) {
    case 'LinkedIn':
      return <StyledSvg as={LinkedInSvg} />;
    case 'Email':
      return <Mail {...iconProps} />;
    case 'GitHub':
      return <StyledSvg as={GitHubSvg} />;
    case 'YouTube':
      return <StyledSvg as={YouTubeSvg} />;
    case 'Résumé':
      return <FileText {...iconProps} />;
    case 'JavaScript':
      return <StyledSvg as={NpmSvg} />;
    case 'Article':
      return <Newspaper {...iconProps} />;
    default:
      console.error(`Unknown contact item label: ${label}`);
      return null;
  }
}

export default ContactIcon;
