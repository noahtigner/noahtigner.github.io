import React from 'react';
import { Stack, Box } from '@mui/material/';

import Link from './link.jsx';

const Footer = () => {
    return (
        <Box
            sx={{
                width: '100vw',
                paddingLeft: '16px',
                paddingRight: '16px',
                fontSize: '16px',
                lineHeight: '32px',
                // letterSpacing: '2px'
                // position: 'absolute',
                // bottom: '0',
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"
                spacing={2}
                // direction={{ xs: 'column', sm: 'row' }}
                // direction={'row'}
                // spacing={{ xs: 1, sm: 2, md: 8 }}
            >
                <div className='signature'>Built in TypeScript with React & Material-UI</div>
                <Stack
                    justifyContent="space-between"
                    alignItems="flex-end"
                    spacing={{ xs: 0, sm: 2 }}
                    direction={{ xs: 'column', sm: 'row' }}
                >
                    <Link target='https://www.linkedin.com/in/noahtigner/' isAnchor={false} text='LinkedIn' />
                    <Link target='https://github.com/noahtigner' isAnchor={false} text='GitHub' />
                    <div>noahzanetigner@gmail.com</div>
                </Stack>
            </Stack>
        </Box>
    )
}

export default Footer;
