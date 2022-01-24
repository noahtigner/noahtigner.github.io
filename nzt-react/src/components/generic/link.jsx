import React from 'react';
import { styled } from '@mui/system';
import { useTheme } from '@mui/styles';

import { HashLink } from 'react-router-hash-link';


const Link = (props) => {
    const theme = useTheme();
    const A = styled('a') ({
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
            color:  `${theme.palette.text.secondary} !important`,
        },
    });

    const HLink = styled(HashLink) ({
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
            color:  `${theme.palette.text.secondary} !important`,
        },
    });

    return (
        props.isAnchor === true
        ? <HLink to={props.target}>{props.text}</HLink>
        : <A href={props.target} target={'_blank'}>{props.text}</A>
    )
}

export default Link;
