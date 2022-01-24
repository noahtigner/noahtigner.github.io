import React from 'react';
import { useTheme } from '@mui/styles';
import { FormControlLabel, Switch, Stack, Box } from '@mui/material/';

import { HashLink } from 'react-router-hash-link';
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
                // borderBottom: `1px solid ${theme.palette.primary.main}`
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={8}
                // direction={{ xs: 'column', sm: 'row' }}
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
                    justifyContent="space-between"
                    alignItems="flex-end"
                    spacing={{ xs: 0, sm: 2 }}
                    direction={{ xs: 'column', sm: 'row' }}
                >
                    {/* <HashLink to={'/#portfolio'} >Port</HashLink> */}
                    <Link target='/#portfolio' isAnchor={true} text='Portfolio' />
                    <Link target='/#experience' isAnchor={true} text='Experience' />
                    <Link target='/#contact' isAnchor={true} text='Contact' />
                </Stack>
            </Stack>
        </Box>
    )
}

export default Header;
