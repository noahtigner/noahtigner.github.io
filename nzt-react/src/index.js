import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import CssBaseline from "@mui/material/CssBaseline";
import { useTheme } from '@mui/styles';
import { createTheme, ThemeProvider, Divider, Button, Box } from '@mui/material/';

import Header from './components/header.jsx';
import Footer from './components/footer.jsx';

import Experience from './components/experience.jsx';
import Portfolio from './components/portfolio.jsx';

const SectionHeader = (props) => {
	return (
		<Divider style={{textAlign: 'center', fontSize: '16px', width: '80%', marginLeft: '10%', marginRight: '10%' }}>{props.content}</Divider>
	)
}

// const breakpoints = {
// 	breakpoints: {
// 		values: {
// 			xs: 0,
// 			sm: 600,
// 			md: 700,
// 			lg: 900,
// 			xl: 1200,
// 		},
// 	}
// }

const themeLight = createTheme({
	typography: {
		fontFamily: 'Poppins, sans-serif'
	},
	palette: {
		background: {
			// default: "#e4f0e2"
			default: "rgb(230, 240, 230)"
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
	const [dark, setDark] = React.useState(true);

	return (
		<ThemeProvider theme={dark ? themeDark : themeLight}>
			<CssBaseline />
			<Header style={{ backgroundColor: dark ? themeDark.palette.background.default : themeLight.palette.background.default }} dark={dark} clickHandler={() => setDark((prev) => !prev)}/>
			<span id={'portfolio'} />
			<Box sx={{ zIndex: 1 }} className='appBody'>
				<SectionHeader content="Some Things I've Built" />
				<br/>
				<Portfolio />
				{/* <br id={'experience'} /> */}
				<br/>
				<SectionHeader content="Experience" />
				<Experience/>
				<br id={'contact'} />
			</Box>

			<Footer />
		</ThemeProvider>
	);
};

ReactDOM.render(
	<React.StrictMode>
		<App />	
	</React.StrictMode>,
	document.getElementById('root')
);
