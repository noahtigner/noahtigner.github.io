import React from 'react';
import { styled } from '@mui/system';
import { useTheme } from '@mui/styles';


const Link = (props) => {
    const theme = useTheme();
    const A = styled('a') ({
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
            color:  `${theme.palette.text.secondary} !important`,
        },
    });

    return (
        <A href={props.target} target={props.newTab ? '_blank' : null}>{props.text}</A>
    )
}

export default Link;
