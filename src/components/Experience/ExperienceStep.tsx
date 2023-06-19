import { ReactNode } from 'react';
import { Step, StepLabel, StepContent, useTheme } from '@mui/material/';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';

const getIcon = (organization: string): ReactNode => {
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
};

function ExperienceStep({
  title,
  organization,
  description,
  ...rest
}: ExperienceItem) {
  const theme = useTheme();

  return (
    <Step active style={{ padding: 0 }} {...rest}>
      <StepLabel StepIconComponent={() => getIcon(organization)}>
        <span style={{ lineHeight: '12px', padding: 0, margin: 0 }}>
          {title}
        </span>
        <br />
        <span
          style={{
            fontSize: '12px',
            color: theme.palette.text.secondary,
          }}
        >
          {organization}
        </span>
      </StepLabel>
      <StepContent style={{ paddingBottom: 0, marginBottom: 0 }}>
        <ul style={{ margin: 0, paddingLeft: '12px' }}>
          {description.map((line) => (
            <li
              key={`${title}-${line.replaceAll(' ', '')}`}
              style={{ fontSize: '8px' }}
            >
              <span style={{ fontSize: '12px', lineHeight: '16px' }}>
                {line}
              </span>
            </li>
          ))}
        </ul>
      </StepContent>
    </Step>
  );
}

export default ExperienceStep;
