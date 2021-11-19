import React, {useState, useEffect} from 'react';
import { darken, Container, Grid, Button, Chip } from '@mui/material/';
import { useTheme } from '@mui/styles';
import { styled } from '@mui/system';
import YouTubeIcon from '@mui/icons-material/YouTube';
import GitHubIcon from '@mui/icons-material/GitHub';

import portfolioItems from '../portfolioItems.json';

const Portfolio = (props) => {
    const theme = useTheme();

    const Card = styled('div') ({
        height: '400px',
        borderRadius: '8px', position: 'relative', 
        boxShadow: `0 4px 8px 0 ${darken(theme.palette.background.default, 0.35)}`,
        '&:hover': {
            backgroundColor: darken(theme.palette.background.default, 0.1),
        }
    });

    const [amountToShow, setAmountToShow] = useState({ showMore: false, shownAmount: window.innerWidth < 900 && window.innerWidth > 600 ? 2 : 3})

    useEffect(() => {
        function handleResize() {
            setAmountToShow({
                ...amountToShow,
                shownAmount: amountToShow.showMore === true ? portfolioItems.items.length : window.innerWidth < 900 && window.innerWidth > 600 ? 2 : 3
            })
        }
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, [amountToShow.showMore, amountToShow.shownAmount]);

    const getLinkIcon = (description) => {
        if(description.includes('Visualization')) {
            return (<YouTubeIcon />)
        }
        else if(description.includes('Git')) {
            return (<GitHubIcon />)
        }
        return null;
    }

    return (
        <>
            <Container width='100%'>
                <Grid container spacing={3} justifyContent="space-evenly">
                    {portfolioItems.items.slice(0, amountToShow.shownAmount).map((item, index) => (
                        <Grid item key={item.title} xs={12} sm={6} md={6} lg={4} xl={4} >
                            <Card sx={{ border: `1px solid ${darken(theme.palette.background.default, 0.1)}`}}>
                                <div style={{letterSpacing: '2px', fontSize: '16px', marginLeft: '8px' }}>{item.title}</div>
                                {/* <CardMedia
                                    component="img"
                                    height="200px"
                                    image={item.image}
                                    alt={item.title}
                                /> */}
                                <img src={item.image} alt={item.title} width='100%' height='200px'/>
                                <div style={{ marginLeft: '8px', marginRight: '8px' }}>
                                    {item.links.map((link) => (
                                        <Chip
                                            label={link.description}
                                            icon={getLinkIcon(link.description)}
                                            component="a"
                                            href={link.target}
                                            target='_blank'
                                            variant="outlined"
                                            color="primary"
                                            clickable
                                            size='small'
                                            sx={{ marginRight: '4px', marginBottom: '4px' }}
                                        />
                                    ))}
                                    <div style={{ fontSize: '12px' }}>
                                        {item.description}
                                    </div>
                                    <div style={{ marginTop: '4px', marginBottom: '4px', position: 'absolute', bottom: 0 }}>
                                        {item.languages.map((language) => (
                                            <Chip label={language} size='small' style={{ marginRight: '4px', marginBottom: '4px', backgroundColor: darken(theme.palette.background.default, 0.2) }}/>
                                        ))}
                                    </div>
                                </div>

                            </Card>
                        </Grid>              
                    ))}
                </Grid>
            </Container>
            <br/>
            <span id={'experience'}></span>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <Button variant="outlined" onClick={() => { setAmountToShow({showMore: !amountToShow.showMore, shownAmount: amountToShow.showMore !== true ? portfolioItems.items.length : window.innerWidth < 900 && window.innerWidth > 600 ? 2 : 3}); }}>{amountToShow.showMore === true ? 'Show Less' : 'Show More'}</Button>
            </div>
        </>
    )
}

export default Portfolio;
