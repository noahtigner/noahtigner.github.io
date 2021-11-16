import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';

import experienceItems from '../experienceItems.json';

export default function Experience() {
	return (
		<Box sx={{ marginLeft: '10%', marginRight: '10%' }}>
			<Stepper orientation="vertical">
				{experienceItems.items.map((item, index) => (
					<Step key={item.label} active={true}>
						<StepLabel
							optional={
								<Typography variant="caption">{item.subtitle}</Typography>
							}
						>
							{item.label}
						</StepLabel>
						<StepContent>
							{item.description.map((line) => (
									<div>• {line}</div>
							))}
						</StepContent>
					</Step>
				))}
			</Stepper>
		</Box>
	);
}
