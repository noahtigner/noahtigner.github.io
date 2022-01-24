import React, {useState, useEffect} from 'react';
import { darken, Container, Grid, Button, Chip, Box } from '@mui/material/';
import { useTheme } from '@mui/styles';
import { styled } from '@mui/system';
import {Sankey} from 'react-vis';



const BudgetVis = (props) => {
    const theme = useTheme();

    const Card = styled('div') ({
        height: '400px',
        minWidth: '300px',
        borderRadius: '8px', position: 'relative', 
        boxShadow: `0 4px 8px 0 ${darken(theme.palette.background.default, 0.35)}`,
        '&:hover': {
            backgroundColor: darken(theme.palette.background.default, 0.1),
        }
    });

    const nodes = [{name: 'a', color: '#1976d2'}, {name: 'b'}, {name: 'c'}];
    const links = [
        {source: 0, target: 1, value: 10, color: 'orange', opacity: 0.9},
        {source: 0, target: 2, value: 20},
        {source: 1, target: 2, value: 20}
    ];



    // useEffect(() => {
        
    
    //     return () => window.removeEventListener('resize', handleResize);
    // }, []);


    return (
        <>
            {/* <br/> */}

            <Box sx={{ height: '90vh', width: '90vw', marginLeft: '5vw', border: `1px solid ${darken(theme.palette.background.default, 0.1)}`, borderRadius: '8px' }}>
                
<Sankey
  nodes={nodes}
  links={links}
  width={window.innerWidth * 0.80}
  height={400}
/>
            </Box>

      
        </>
    )
}

export default BudgetVis;
