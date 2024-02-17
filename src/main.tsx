import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga';

import App from './App.tsx';
import './index.css';

ReactGA.initialize(import.meta.env.GOOGLE_ANALYTICS_ID);
ReactGA.pageview(window.location.pathname + window.location.search);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
