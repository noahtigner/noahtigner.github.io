import React from 'react';

const Footer = () => {
    return (
        <>

            <div id='tr-footer'></div>

            <div id='footer' className="footer">
                <ol className='navbar'>
                    <li className='signature' style={{'float': 'left'}}>Designed and Built by Yours Truly</li>
                    <li>noahzanetigner@gmail.com</li>
                    <li><a href="https://www.linkedin.com/in/noahtigner/" target='_blank'>LinkedIn</a></li>
                    <li><a href="https://github.com/noahtigner" target='_blank'>GitHub</a></li>
                </ol>
            </div>

        </>
    )
}

export default Footer;
