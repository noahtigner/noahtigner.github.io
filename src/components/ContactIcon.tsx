import {
  GitHub,
  YouTube,
  LinkedIn,
  EmailOutlined,
  InsertDriveFileOutlined,
  Article,
} from '@mui/icons-material';
import styled from '@emotion/styled';

import NpmSvg from '~/assets/icons/npm.svg?react';
import contactItems from '~/assets/data/contactItems.json';

interface ContactIconProps {
  label: (typeof contactItems)[number]['label'];
}

const StyledSvg = styled.svg`
  fill: var(--color-text-primary) !important;
  width: 20px;
  height: 20px;
`;

function ContactIcon({ label }: ContactIconProps) {
  switch (label) {
    case 'LinkedIn':
      return <StyledSvg as={LinkedIn} />;
    case 'Email':
      return <StyledSvg as={EmailOutlined} />;
    case 'GitHub':
      return <StyledSvg as={GitHub} />;
    case 'YouTube':
      return <StyledSvg as={YouTube} />;
    case 'Résumé':
      return <StyledSvg as={InsertDriveFileOutlined} />;
    case 'JavaScript':
      return <StyledSvg as={NpmSvg} />;
    case 'Article':
      return <StyledSvg as={Article} />;
    default:
      console.error(`Unknown contact item label: ${label}`);
      return null;
  }
}

export default ContactIcon;
