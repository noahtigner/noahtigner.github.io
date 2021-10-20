import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import logo from './logo.svg';
// import { AccessAlarm, ThreeDRotation } from '@mui/icons-material';
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';

ReactDOM.render(
	<React.StrictMode>
		<Header/>
		<div className="body">
			<img src={logo} className="spin" alt="logo" />
			<p>
				Hello World
			</p>
			{/* <AccessAlarmIcon /> */}
		</div>
		<Footer/>
	</React.StrictMode>,
	document.getElementById('root')
);
