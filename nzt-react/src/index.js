import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import ReactGA from 'react-ga';

import './index.css';
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider, Box, Grid, Container } from '@mui/material/';

import Header from './components/generic/header.jsx';
import Footer from './components/generic/footer.jsx';
import Divider from './components/generic/divider.jsx';

import Experience from './components/experience.jsx';
import Portfolio from './components/portfolio.jsx';
import BudgetVis from './components/budgetVis.jsx';


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
	const history = createBrowserHistory();

	const trackingId = "G-CBV6MH0KTB";
	ReactGA.initialize(trackingId);

	// Initialize google analytics page view tracking
	history.listen(location => {
		ReactGA.set({ page: location.pathname }); // Update the user's current page
		ReactGA.pageview(location.pathname); // Record a pageview for the given page
	});

	const [dark, setDark] = React.useState(false);

	return (
		<ThemeProvider theme={dark ? themeDark : themeLight}>
			<CssBaseline />
				<HashRouter>
					<span id={'portfolio'} />
					<Header style={{ backgroundColor: dark ? themeDark.palette.background.default : themeLight.palette.background.default }} dark={dark} clickHandler={() => setDark((prev) => !prev)}/>

						<Box sx={{ zIndex: 1, width: '100vw' }} className='appBody'>
							<Routes>
								

								<Route exact path='/' element={
									<>
										<Divider content="Some Things I've Built" />
										<br/>
										<Portfolio />
										{/* <br id={'experience'} /> */}
										<br/>
										<Divider content="Experience" />
										<Experience/>
										<br id={'contact'} />
									</>
								} />

								<Route exact path='/budget-vis' element={<BudgetVis />} />

							</Routes>
							{/* </HashRouter> */}
						</Box>

					<Footer />
				</HashRouter>
		</ThemeProvider>
	);
};

ReactDOM.render(
	<React.StrictMode>
		<App />	
	</React.StrictMode>,
	document.getElementById('root')
);
