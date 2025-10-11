import { type ReactNode } from 'react';
import { Step, StepLabel, StepContent, useTheme } from '@mui/material/';
import {
  BuildOutlined as BuildOutlinedIcon,
  CloudOutlined as CloudOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  CodeOutlined as CodeOutlinedIcon,
  DataObjectOutlined as DataObjectOutlinedIcon,
} from '@mui/icons-material';

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

function ExperienceStep({
  title,
  organization,
  description,
  ...rest
}: ExperienceItem) {
  const theme = useTheme();

  return (
    <Step active style={{ padding: 0 }} {...rest}>
      <StepLabel
        StepIconComponent={() => <ExperienceIcon organization={organization} />}
      >
        <span style={{ fontSize: '1rem', padding: 0, margin: 0 }}>{title}</span>
        <br />
        <span
          style={{
            fontSize: '1rem',
            color: theme.palette.text.secondary,
          }}
        >
          {organization}
        </span>
      </StepLabel>
      <StepContent style={{ paddingBottom: 0, marginBottom: 0 }}>
        <ul style={{ margin: 0, paddingLeft: '8px' }}>
          {description.map((line) => (
            <li
              key={`${title}-${line.replaceAll(' ', '')}`}
              style={{ fontSize: '0.875rem' }}
            >
              {line}
            </li>
          ))}
        </ul>
      </StepContent>
    </Step>
  );
}

export default ExperienceStep;
