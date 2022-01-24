import React from 'react';

import { Divider as MuiDivider, Grid, Container } from '@mui/material/';

const Divider = (props) => {

    return (
        <Container width='100%'>
			{/* <Grid container spacing={2}> */}
				<Grid item xs={12}>
					<MuiDivider style={{textAlign: 'center', fontSize: '16px' }}>{props.content}</MuiDivider>
				</Grid>
			{/* </Grid> */}
		</Container>
    )
}

export default Divider;
