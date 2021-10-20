import React from 'react';

const Header = () => {
    return (

        <div className="header">
            <ol className='navbar'>
                <li className='logo' style={{"float": "left"}}>Noah Tigner</li>
                <li><a href="#/footer">Contact</a></li>
                <li><a href="#/Experience">Experience</a></li>
                <li><a href="#/Skills">Skills</a></li>
                <li><a href="#/Portfolio">Portfolio</a></li>
                {/* <li className='small' style='display: none;'>Noah Tigner</li> */}
            </ol>
            <div className="progress-container">
                <div className="progress-bar" id="myBar"></div>
            </div> 
        </div>
    )
}

export default Header;
