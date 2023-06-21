import { Stepper } from '@mui/material/';

import experienceItems from '../../data/experienceItems.json';
import ExperienceStep from './ExperienceStep';

function Experience() {
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

export default Experience;
