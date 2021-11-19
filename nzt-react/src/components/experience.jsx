import React from 'react';

import { useTheme } from '@mui/styles';
import { Container, Grid, Stepper, Step, StepLabel, StepContent } from '@mui/material/';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import CloudCircleOutlinedIcon from '@mui/icons-material/CloudCircleOutlined';

import experienceItems from '../experienceItems.json';

export default function Experience() {
	const theme = useTheme();
	
	return (
		<Container width='100%'>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Stepper orientation="vertical">
						{experienceItems.items.map((item, index) => (
							<Step key={item.label} active={true} style={{ padding: 0 }} >
								<StepLabel
									StepIconComponent={() => item.subtitle === 'HP' ? <CloudCircleOutlinedIcon color='primary' sx={{ fontSize: 25 }}/> :  <BuildCircleOutlinedIcon color='primary' />}
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
