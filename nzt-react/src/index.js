import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './card.css';
// import logo from './logo.svg';


// import { AccessAlarm, ThreeDRotation } from '@mui/icons-material';

import { Divider  } from '@mui/material/';
// import MoreVertSharpIcon from '@mui/icons-material/MoreVertSharp';


import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
// import Card from './components/card.jsx';
// import Body from './components/body.jsx';
// import randomColor from 'randomcolor';

import Experience from './components/experience.jsx';
import Portfolio from './components/portfolio.jsx';

const SectionHeader = (props) => {
	return (
		<Divider style={{textAlign: 'center', fontSize: '16px', width: '80%', marginLeft: '10%', marginRight: '10%'}}>{props.content}</Divider>
	)
}


ReactDOM.render(
	<React.StrictMode>
		<span id={'portfolio'} />
		<Header />

		<div className="appBody">
			
			<SectionHeader content="Some things I've built" />
			<br/>
			<Portfolio />
			<br/>
			<span id={'experience'} />
			<SectionHeader content="Experience" />
			<Experience/>
			<br/>
			<span id={'contact'} />

		</div>

		<Footer />
	</React.StrictMode>,
	document.getElementById('root')
);
