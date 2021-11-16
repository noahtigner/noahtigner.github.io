import React, {useState, useEffect} from 'react';
import { Button } from '@mui/material/';


import Card from './card.jsx';
import portfolioItems from '../portfolioItems.json';

const Portfolio = (props) => {
    const [showMore, setShowMore] = useState(false);

    return (
        <>
            <div className='cardRow'>

                {portfolioItems.items.slice(0, showMore === true ? portfolioItems.items.length : 3).map((item, index) => (
                    <Card
                        title={item.title}
                        description={item.description}
                        image={item.image}
                        languages={item.languages}
                        links={item.links}
                        key={'card'+index}
                    />
                ))}

                

            </div>

            <div style={{display: 'flex', justifyContent: 'center'}}>
                <Button variant="outlined" onClick={() => setShowMore(!showMore)}>{showMore === true ? 'Show Less' : 'Show More'}</Button>
            </div>
        </>
    )
}

export default Portfolio;
