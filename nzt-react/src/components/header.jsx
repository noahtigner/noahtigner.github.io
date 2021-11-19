import React from 'react';
import { useTheme } from '@mui/styles';
import { FormControlLabel, Switch, Stack, Box } from '@mui/material/';

import Link from './link.jsx';

const Header = (props) => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                position: 'fixed',
                zIndex: 10,
                width: '100vw',
                backgroundColor: theme.palette.background.default,
                paddingLeft: '16px',
                paddingRight: '16px',
                fontSize: '16px',
                lineHeight: '32px',
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={8}
                // direction={{ xs: 'column', sm: 'row' }}
                direction={'row'}
                // spacing={{ xs: 1, sm: 2, md: 8 }}
            >
                <Stack
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                    // direction={{ xs: 'column', sm: 'row' }}
                >
                    Noah Tigner
                    <FormControlLabel  onClick={props.clickHandler} control={<Switch size="small" defaultChecked checked={props.dark} />} label={<span style={{ fontSize: '12px' }}>{props.dark ? 'Dark' : 'Light'}</span>} />
                </Stack>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    spacing={{ xs: 0, sm: 2 }}
                    direction={{ xs: 'column', sm: 'row' }}
                >
                    <Link target='/#portfolio' newTab={false} text='Portfolio' />
                    <Link target='/#experience' newTab={false} text='Experience' />
                    <Link target='/#contact' newTab={false} text='Contact' />
                </Stack>
            </Stack>
        </Box>
    )
}

export default Header;
