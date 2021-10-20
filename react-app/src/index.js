import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
import logo from './logo.svg';

ReactDOM.render(
	<React.StrictMode>
		<>
			<header className="body">
				<img src={logo} className="spin" alt="logo" />
				<p>
					Placeholder :)
				</p>
			</header>
		</>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
