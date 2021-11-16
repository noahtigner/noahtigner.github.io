import React from 'react';

import { Box, Grid, Card as MUICard, CardContent, CardActions, Typography, Button, Avatar, IconButton, CardHeader, CardMedia, Chip } from '@mui/material/';
import YouTubeIcon from '@mui/icons-material/YouTube';
import GitHubIcon from '@mui/icons-material/GitHub';


export default function Card(props) {

    const getLinkIcon = (description) => {
        if(description.includes('Youtube')) {
            return (<YouTubeIcon />)
        }
        else if(description.includes('Git')) {
            return (<GitHubIcon />)
        }
        return null;
    }

    return (
        // <MUICard sx={{ width: "300px" }}>
        //     <CardHeader
        //         action={
        //             <IconButton aria-label="settings">
        //                 <MoreVertSharpIcon />
        //             </IconButton>
        //         }
        //         title={props.title}
        //         subheader={props.subtitle}
        //     />

        //     <CardMedia
        //         component="img"
        //         height="200px"
        //         image={props.image}
        //         alt={props.title}
        //     />

        //     <CardContent>
        //         Card Content
        //     </CardContent>

        //     <CardActions>
        //         <Button size="small">Learn More</Button>
        //     </CardActions>

        // </MUICard>

        <div className='cardColumn'>
            <div className='card'>
            <div className='cardTitle' style={{letterSpacing: '2px', fontSize: '18px'}}>{props.title}</div>
                <div className='cardUpper'>
                    <img src={props.image} alt={props.title} width='100%' height='100%'/>
                </div> 

                <div className='cardLower'>
                    {/* <span style={{letterSpacing: '2px', fontSize: '18px'}}>{props.title}</span> */}
                    {props.links.map((link) => (
                        // <div>{getLinkIcon(link.description)}<a href={link.target}>{link.description}</a></div>
                        <Chip
                            label={link.description}
                            icon={getLinkIcon(link.description)}
                            component="a"
                            href={link.target}
                            variant="outlined"
                            color="primary"
                            clickable
                            size='small'
                            style={{ marginRight: '4px', marginTop: '8px', justifySelf: 'center' }}
                        />
                    ))}

                    <p className='cardText'>
                        {props.description}
                    </p>
                    <div style={{ marginTop: '8px', marginBottom: '8px', position: 'absolute', bottom: 0 }}>
                        {props.languages.map((language) => (
                            <Chip label={language} size='small' style={{ marginRight: '4px' }}/>
                        ))}
                    </div>
                    
                </div>
                {/* <ul className='cardLanguages'>
                    {props.languages.map((language) => (
                        <li>{language}</li>
                    ))}
                </ul> */}
                

            </div>
        </div>
    );
}