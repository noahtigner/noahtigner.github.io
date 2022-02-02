import React, { FC, ReactElement } from 'react';

import { useTheme } from '@mui/styles';
import { Container, Grid, Stepper, Step, StepLabel, StepContent } from '@mui/material/';
// import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
// import BuildIcon from '@mui/icons-material/Build';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
// import CloudCircleOutlinedIcon from '@mui/icons-material/CloudCircleOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
// import AvTimerIcon from '@mui/icons-material/AvTimer';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

import experienceItems from '../experienceItems.json';

const Experience: FC<any> = (): ReactElement => {
	interface Theme {
        palette: {
            text: {
                secondary: string,
                [key: string]: any
            }
            [key: string]: any
        },
        [key: string]: any
    }
	const theme: Theme = useTheme();

	const iconMap: { [key: string]: any } = {
		'HP': <CloudOutlinedIcon color='primary' />,
		'Air-Weigh': <BuildOutlinedIcon color='primary' />,
		'TDS': <SettingsOutlinedIcon color='primary' />,
		'University of Oregon': <SchoolOutlinedIcon color='primary' />,
	}
	
	return (
		<Container sx={{ width: '100%' }}>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Stepper orientation="vertical">
						{experienceItems.items.map((item, index) => (
							<Step key={`${item.label}-${item.subtitle}`} active={true} style={{ padding: 0 }} >
								<StepLabel
									StepIconComponent={() => iconMap[item.subtitle]}
								>
									<span style={{ lineHeight: '12px', padding: 0, margin: 0 }}>{item.label}</span>
									<br/>
									<span style={{ fontSize: '12px', color: theme.palette.text.secondary }}>{item.subtitle}</span>
								</StepLabel>
								<StepContent style={{ paddingBottom: 0, marginBottom: 0 }} >
									<ul style={{ margin: 0, paddingLeft: '12px' }}>
										{item.description.map((line) => (
											<li style={{ fontSize: '8px' }}><span style={{ fontSize: '12px', lineHeight: '16px' }}>{line}</span></li>
										))}
									</ul>
								</StepContent>
							</Step>
						))}
					</Stepper>
				</Grid>
			</Grid>
		</Container>
	);
}

export default Experience;
