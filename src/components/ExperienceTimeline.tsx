import type { ReactNode } from 'react';
import experienceItems from '../assets/data/experienceItems.json';

import {
  BuildOutlined as BuildOutlinedIcon,
  CloudOutlined as CloudOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  CodeOutlined as CodeOutlinedIcon,
  DataObjectOutlined as DataObjectOutlinedIcon,
} from '@mui/icons-material';
import styled from '@emotion/styled';

function ExperienceIcon({ organization }: { organization: string }): ReactNode {
  switch (organization) {
    case 'Alteryx':
      return <CodeOutlinedIcon color="primary" />;
    case 'HP':
      return <CloudOutlinedIcon color="primary" />;
    case 'Air-Weigh':
      return <BuildOutlinedIcon color="primary" />;
    case 'TDS Telecom':
      return <SettingsOutlinedIcon color="primary" />;
    case 'University of Oregon':
      return <SchoolOutlinedIcon color="primary" />;
    default:
      return <DataObjectOutlinedIcon color="primary" />;
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
              <h4>{title}</h4>
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
