import type { ReactNode } from 'react';
import {
  BuildOutlined as BuildOutlinedIcon,
  CloudOutlined as CloudOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  CodeOutlined as CodeOutlinedIcon,
  DataObjectOutlined as DataObjectOutlinedIcon,
} from '@mui/icons-material';
import styled from '@emotion/styled';

import experienceItems from '~/assets/data/experienceItems.json';

const StyledSvg = styled.svg`
  fill: var(--color-text-primary) !important;
  width: 21px;
  height: 21px;
`;

function ExperienceIcon({ organization }: { organization: string }): ReactNode {
  switch (organization) {
    case 'Alteryx':
      return <StyledSvg as={CodeOutlinedIcon} />;
    case 'HP':
      return <StyledSvg as={CloudOutlinedIcon} />;
    case 'Air-Weigh':
      return <StyledSvg as={BuildOutlinedIcon} />;
    case 'TDS Telecom':
      return <StyledSvg as={SettingsOutlinedIcon} />;
    case 'University of Oregon':
      return <StyledSvg as={SchoolOutlinedIcon} />;
    default:
      return <StyledSvg as={DataObjectOutlinedIcon} />;
  }
}

const TimelineContainer = styled.div`
  position: relative;
  & > div:last-child .timeline-content:before {
    display: none;
  }
`;

const TimelineContent = styled.ul`
  position: relative;
  padding-left: calc(20px + 0.5rem);
  padding-bottom: 2rem;
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--color-divider);
    transform: translateX(10px) translateY(1px);
  }
`;

const ListItem = styled.li`
  font-size: 1rem;
  margin-left: 1rem;
  &::marker {
    color: var(--color-text-secondary);
  }
`;

export default function ExperienceTimeline() {
  return (
    <TimelineContainer>
      {experienceItems.map(({ title, organization, description }) => (
        <div key={`${title}-${organization}`}>
          <span
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ExperienceIcon organization={organization} />
            <span>
              <h3 style={{ fontSize: '1rem' }}>{title}</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {organization}
              </p>
            </span>
          </span>
          <TimelineContent className="timeline-content">
            {description.map((line) => (
              <ListItem key={`${title}-${line.replaceAll(' ', '')}`}>
                {line}
              </ListItem>
            ))}
          </TimelineContent>
        </div>
      ))}
    </TimelineContainer>
  );
}
