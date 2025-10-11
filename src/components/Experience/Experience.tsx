import { Stepper } from '@mui/material';

import experienceItems from '../../assets/data/experienceItems.json';
import ExperienceStep from './ExperienceStep';

export default function Experience() {
  return (
    <Stepper orientation="vertical">
      {experienceItems.map(({ title, organization, description }) => (
        <ExperienceStep
          key={`${title.replaceAll(' ', '')}-${organization.replaceAll(
            ' ',
            ''
          )}`}
          title={title}
          organization={organization}
          description={description}
        />
      ))}
    </Stepper>
  );
}
