import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider, Box } from '@mui/material/';

import Header from './components/generic/header';
import Footer from './components/generic/footer';
import Divider from './components/generic/divider';

import Experience from './components/experience';
import Portfolio from './components/portfolio';


const themeLight = createTheme({
	typography: {
		fontFamily: 'Poppins, sans-serif'
	},
	palette: {
		background: {
			// default: "#e4f0e2"
			default: "rgb(250, 250, 250)"
		},
		text: {
			primary: 'rgb(35, 35, 35)',
			secondary: 'rgb(100, 100, 100)'
		}
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 700,
			lg: 900,
			xl: 1200,
		},
	}
  });
  
  const themeDark = createTheme({
	typography: {
		fontFamily: 'Poppins, sans-serif'
	},
	palette: {
		background: {
			default: 'rgb(35, 35, 35)'
		},
		text: {
			primary: 'rgb(230, 240, 230)',
			secondary: 'rgb(150, 150, 150)'
		}
	},
	components: {
		MuiDivider: {
			styleOverrides: {
				root: {
					"::before": {
						borderColor: 'rgb(150, 150, 150)'
						// borderColor: '#1976d2'
					},
					"::after": {
						// borderColor: 'rgb(189, 189, 189)'
						borderColor: 'rgb(150, 150, 150)'
					},
				},
			},
		},
		// MuiChip: {
		// 	styleOverrides: {
		// 		root: {
		// 			// // // backgroundColor: 'rgb(25, 25, 25)',
		// 			// border: '1px solid rgb(5, 5, 5)'
		// 		},
		// 	},
		// }
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 700,
			lg: 900,
			xl: 1200,
		},
	}
  });

const App = () => {
	const [dark, setDark] = useState<boolean>(false);

	return (
		<ThemeProvider theme={dark ? themeDark : themeLight}>
			<CssBaseline />

			<span id={'portfolio'} />
			<Header style={{ backgroundColor: dark ? themeDark.palette.background.default : themeLight.palette.background.default }} dark={dark} clickHandler={() => setDark((prev) => !prev)}/>

			<Box sx={{ zIndex: 1, width: '100vw' }} className='appBody'>
			<Divider content="Some Things I've Built" />
				<br/>
				<Portfolio />
				{/* <br id={'experience'} /> */}
				<br/>
				<Divider content="Experience" />
				<Experience/>
				<br id={'contact'} />
			</Box>

			<Footer />
		</ThemeProvider>
	)
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

export { App };
