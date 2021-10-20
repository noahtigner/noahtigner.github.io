import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import logo from './logo.svg';

ReactDOM.render(
	<React.StrictMode>
		<div className="body">
			<img src={logo} className="spin" alt="logo" />
			<p>
				Hello World
			</p>
		</div>
	</React.StrictMode>,
	document.getElementById('root')
);
