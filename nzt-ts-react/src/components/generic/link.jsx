import React from 'react';
import { styled } from '@mui/system';
import { useTheme } from '@mui/styles';
import { Link as MuiLink } from '@mui/material/';


// import { HashLink } from 'react-router-hash-link';


const Link = (props) => {
    const theme = useTheme();
    const A = styled('a') ({
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
            color:  `${theme.palette.text.secondary} !important`,
        },
    });

    const MLink = styled(MuiLink) ({
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
            color:  `${theme.palette.text.secondary} !important`,
        },
    });

    return (
        props.isAnchor === true
        ? <MLink href={props.target}>{props.text}</MLink>
        : <A href={props.target} target={'_blank'}>{props.text}</A>
    )
}

export default Link;
