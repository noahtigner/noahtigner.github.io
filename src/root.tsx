import { StrictMode, type ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from '~/router/+types/root';
import TopNav from '~/components/TopNav/TopNav';
import Footer from '~/components/Footer/Footer';
import MetaTags from '~/components/MetaTags';
import inlinedStyles from '~/index.css?inline';
import ErrorPage from './components/ErrorPage';

const gtmId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
        <script
          async
          src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(
            gtmId
          )}`}
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
        <MetaTags
          title="Noah Tigner's Portfolio"
          description="Noah Tigner's portfolio and digital résumé. Check out my projects, view my experience, and get in touch."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.noahtigner.com/noah-tigner.jpeg"
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <noscript>
          <h1>Noah Tigner&apos;s portfolio and digital résumé</h1>
          <h2>Contact:</h2>
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
            src={`https://www.googletagmanager.com/ns.html?id=${import.meta.env.VITE_GOOGLE_ANALYTICS_ID}`}
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
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return null;
    }
    message = 'Error';
    details = error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Layout>
      <ErrorPage message={message} details={details} stack={stack} />
    </Layout>
  );
}

export default function App() {
  return (
    <StrictMode>
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
              maxWidth: 'var(--size-lg)',
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
            <Outlet />
          </main>
        </span>
        <Footer />
      </span>
    </StrictMode>
  );
}
