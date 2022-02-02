import React, { FC, ReactElement } from 'react';
import { styled } from '@mui/system';
import { useTheme } from '@mui/styles';
import { Link as MuiLink } from '@mui/material/';

const Link: FC<any> = (props: { target: string, text: string, isAnchor: boolean }): ReactElement => {
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
