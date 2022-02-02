import React, { FC, ReactElement } from 'react';
import { Divider as MuiDivider, Grid, Container } from '@mui/material/';

const Divider: FC<any> = (props: { content: string }): ReactElement => {
    return (
        <Container sx={{ width: '100%' }}>
			<Grid item xs={12}>
				<MuiDivider style={{textAlign: 'center', fontSize: '16px' }}>{props.content}</MuiDivider>
			</Grid>
		</Container>
    );
}

export default Divider;
