import { StrictMode, type ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Navigate,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from '~/router/+types/root';
import TopNav from '~/components/TopNav/TopNav';
import Footer from '~/components/Footer/Footer';
import useScrollToHash from '~/hooks/useScrollToHash';
import inlinedStyles from '~/index.css?inline';
import ErrorPage from './components/ErrorPage';
import { paths } from '~/routes';

const gtmId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

const isSingleFetchNoResultError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    error.message.startsWith('No result found for routeId')
  );
};

function AppWrappers({ children }: { children?: ReactNode }) {
  return (
    <span
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="root"
    >
      <span style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <TopNav />
        <main
          style={{
            boxSizing: 'border-box',
            width: '100%',
            maxWidth: 'var(--size-xl)',
            marginTop: '32px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: '16px',
            paddingRight: '16px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </main>
      </span>
      <Footer />
    </span>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    // eslint-disable-next-line react/no-unknown-property
    <html lang="en" prefix="og: https://ogp.me/ns#">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;1,300;1,400&display=swap"
        />
        {/* Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gtmId}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gtmId}');`,
          }}
        />
        {/* Styles */}
        <style>{inlinedStyles}</style>
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#141414" />
        <meta name="color-scheme" content="dark" />
        <meta name="author" content="Noah Tigner" />
        <meta name="site_name" content="Noah Tigner" lang="es" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Noah Tigner" />
        <meta
          property="og:image"
          content="https://www.noahtigner.com/noah-tigner.webp"
        />
      </head>
      <body>
        <AppWrappers>{children}</AppWrappers>
        <ScrollRestoration />
        <Scripts />
        <noscript>
          <p>Noah Tigner&apos;s portfolio and digital résumé</p>
          <p>Contact:</p>
          <ul>
            <li>
              <a href="mailto:noahzanetigner@gmail.com">
                noahzanetigner@gmail.com
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/noahtigner/">LinkedIn</a>
            </li>
            <li>
              <a href="https://github.com/noahtigner">GitHub</a>
            </li>
            <li>
              <a href="https://www.youtube.com/@noahtigner4283">YouTube</a>
            </li>
          </ul>
          <p>Please enable JavaScript to get the most out of this page</p>
          <iframe
            title="Google Tag Manager"
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = 'Error';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (
    (isRouteErrorResponse(error) && error.status === 404) ||
    isSingleFetchNoResultError(error)
  ) {
    return <Navigate to={paths.error404} replace />;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return <ErrorPage message={message} details={details} stack={stack} />;
}

export default function App() {
  useScrollToHash();

  return (
    <StrictMode>
      <Outlet />
    </StrictMode>
  );
}
