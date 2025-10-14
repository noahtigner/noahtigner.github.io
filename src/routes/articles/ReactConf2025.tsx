import { Link as RouterLink } from 'react-router';
import { Divider, Grid, Link, Typography } from '@mui/material';

import MetaTags from '../../components/MetaTags';
import paths from '../../paths';
import type { ReactNode } from 'react';

const reactNativeVideoUrls = {
  'React Native Keynote': {
    direct:
      'https://www.youtube.com/live/p9OcztRyDl0?si=BFKnf9nEOp5rV-Wp&t=2289',
    embed:
      'https://www.youtube.com/embed/p9OcztRyDl0?si=SH1hbh5txKNmzN5_&amp;start=2289',
  },
  'React Strict DOM': {
    direct:
      'https://www.youtube.com/live/p9OcztRyDl0?si=Sji5bJSpCRiE8Avw&t=9040',
    embed:
      'https://www.youtube.com/embed/p9OcztRyDl0?si=Sji5bJSpCRiE8Avw&amp;start=9040',
  },
  'Reimagining Lists in React Native': {
    direct:
      'https://www.youtube.com/live/p9OcztRyDl0?si=3Xp8W9p7nwnsSrLX&t=10377',
    embed:
      'https://www.youtube.com/embed/p9OcztRyDl0?si=3Xp8W9p7nwnsSrLX&amp;start=10377',
  },
};

function H3({ children }: { children: ReactNode }) {
  return (
    <Typography variant="h3" fontSize="2rem">
      {children}
    </Typography>
  );
}

function H4({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Typography variant="h4" fontSize="1.5rem" className={className}>
      {children}
    </Typography>
  );
}

function YoutubeIframe({ src, title }: { src: string; title: string }) {
  return (
    <iframe
      src={src}
      title={`YouTube video player - ${title}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      loading="lazy"
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
      }}
    />
  );
}

function SectionIntro() {
  return (
    <>
      <Typography>
        I was fortunate enough to attend{' '}
        <Link
          href="https://conf.react.dev/agenda"
          target="_blank"
          rel="noopener"
        >
          React Conf 2025
        </Link>{' '}
        in Henderson, NV, and learn from the best in the React community. The
        conference boasted over 600 attendees and 250k+ livestream viewers. Over
        the course of 2 days, members of the React team shared their vision for
        the future of React, and the community gathered to discuss the latest
        trends in web development.
      </Typography>
      <Typography>
        Perhaps the most important announcement for the long-term future of
        React was the creation of the React Foundation. The foundation will
        maintain and govern React, React Native, JSX, and several other projects
        in the ecosystem. This move will bring more voices to the table as React
        continues to grow and evolve.
      </Typography>
    </>
  );
}

function SectionCompiler() {
  return (
    <>
      <H3>React Compiler 1.0</H3>
      <Typography>
        The React Compiler was officially released on day one of the conference,
        marking a significant milestone for React optimization. The compiler
        supports React 17, 18, and 19, providing automatic memoization without
        requiring developers to manually wrap components in{' '}
        <span className="code">React.memo</span> or use{' '}
        <span className="code">useMemo</span> and{' '}
        <span className="code">useCallback</span>. What sets this compiler apart
        from existing linters and build tools is its deep understanding of your
        codebase, allowing it to make intelligent optimization decisions that
        were previously the developer&apos;s responsibility (and a common source
        of bugs).
      </Typography>
      <Typography>
        The compiler is designed with incremental adoption in mind, with{' '}
        <Link
          href="https://react.dev/learn/react-compiler/incremental-adoption"
          target="_blank"
          rel="noopener"
        >
          comprehensive documentation
        </Link>{' '}
        guiding teams through the migration process. Currently available as a
        Babel plugin, it integrates with popular build tools like{' '}
        <Link
          href="https://react.dev/learn/react-compiler/installation#vite"
          target="_blank"
          rel="noopener"
        >
          Vite
        </Link>
        , making it accessible to most React projects. The performance
        improvements are substantial, with the{' '}
        <Link
          href="https://react.dev/blog/2025/10/07/react-compiler-1#react-compiler-at-meta"
          target="_blank"
          rel="noopener"
        >
          release announcement
        </Link>{' '}
        boasting 2.5x faster interactions in some cases, without any added
        memory overhead.
      </Typography>
      <H4>eslint-plugin-react-hooks v7</H4>
      <Typography>
        Alongside the compiler, the React team released version 7 of{' '}
        <Link
          href="https://react.dev/blog/2025/10/01/react-19-2#eslint-plugin-react-hooks"
          target="_blank"
          rel="noopener"
        >
          <em>eslint-plugin-react-hooks</em>
        </Link>
        . One of the new rules identifies components that the compiler cannot
        optimize, and will signal to the compiler that these components should
        be skipped. While the primary focus of these new rules is to assist with
        gradual adoption of the compiler, many of the rules are incredibly
        useful on their own. Rules such as{' '}
        <span className="code">set-state-in-effect</span>,{' '}
        <span className="code">set-state-in-render</span>, and{' '}
        <span className="code">immutability</span> identify common pitfalls
        associated with <span className="code">useState</span>, and rules such
        as <span className="code">use-memo</span> and{' '}
        <span className="code">refs</span> help developers steer clear of other
        common React mistakes. Note that the docs point to version 6, but{' '}
        <Link
          href="https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/CHANGELOG.md#610"
          target="_blank"
          rel="noopener"
        >
          version 7 was released almost immediately
        </Link>{' '}
        after the conference. To get access to all of these new rules, upgrade
        to v7 and use the <span className="code">recommended-latest</span>{' '}
        configuration.
      </Typography>
    </>
  );
}

function SectionReact19_2() {
  return (
    <>
      <H3>The Future Is Now: React 19.2</H3>
      <Typography>
        React 19.2 introduces several exciting new features which will benefit
        both UX and DevEx. The React team put a strong emphasis on developer
        experience by introducing{' '}
        <Link
          href="https://react.dev/reference/dev-tools/react-performance-tracks"
          target="_blank"
          rel="noopener"
        >
          <em>React Performance Tracks</em>
        </Link>
        , an expansion of Chrome DevTools for performance profiling. The team
        also maintained the momentum around SSR and RSCs by introducing{' '}
        <span className="code">cacheSignal()</span>, which tells you when the{' '}
        <span className="code">cache()</span> lifetime of a RSC has ended, and{' '}
        <Link
          href="https://react.dev/blog/2025/10/01/react-19-2#batching-suspense-boundaries-for-ssr"
          target="_blank"
          rel="noopener"
        >
          bug fixes to suspense boundaries in SSR
        </Link>
        . The most notable new features include
        <span className="code">{'<Activity />'}</span>,{' '}
        <span className="code">useEffectEvent()</span>, and partial
        pre-rendering.
      </Typography>
      <H4 className="code">{'<Activity />'}</H4>
      <Typography>
        <span className="code">{'<Activity />'}</span> is a new React component
        that allows developers to declaratively pre-render and prioritize
        content. Components can be pre-rendered (and hidden) by setting the mode
        to <span className="code">&quot;hidden&quot;</span>, and can then be
        revealed by changing the mode to{' '}
        <span className="code">&quot;visible&quot;</span>.{' '}
        <span className="code">&quot;hidden&quot;</span> hides the children,
        unmounts effects, and de-prioritizes updates, allowing things like
        images and data to be loaded in the background without blocking the more
        important <span className="code">&quot;visible&quot;</span> content.
        Notably, state is persisted between mode changes. While these are the
        only two modes currently available, the team intends to add more in the
        future, hence calling the prop <span className="code">mode</span> rather
        than <span className="code">visible</span>.
      </Typography>
      <Typography>
        One example where this behavior is useful is a modal sitting on top of a
        busy page. We <em>may</em> still want updates to occur in the
        background, but render priority should be given to the modal&apos;s
        content. If the modal is closely associated with an action such as
        adding an item to a list, we can even pre-render the list with the new
        item in the background, and then reveal it when the user submits the
        action and closes the modal.
      </Typography>
      <Typography>
        Another use case is for navigation. If there is a strong likelihood of
        users visiting page B after page A, we can pre-render page B in the
        background to reduce the navigation time, since data and assets such as
        css and images will already be loaded. This may prove especially useful
        routing frameworks that do not already have built-in prefetching.
      </Typography>
      <H4 className="code">{'useEffectEvent()'}</H4>
      <Typography>...</Typography>
      <H4>Partial Pre-Rendering</H4>
      <Typography>...</Typography>
    </>
  );
}

function SectionReactNative() {
  return (
    <>
      <H3>React Native</H3>
      <Typography>
        Since my focus is primarily on web development, the main focus of this
        article will be on the web-development side of React. However, this is
        an exciting time for mobile and cross-platform developers, and I
        encourage you to watch the{' '}
        <Link
          href={reactNativeVideoUrls['React Native Keynote'].direct}
          target="_blank"
          rel="noopener"
        >
          React Native Keynote
        </Link>
        {', '} and the presentations on{' '}
        <Link
          href={reactNativeVideoUrls['React Strict DOM'].direct}
          target="_blank"
          rel="noopener"
          fontStyle="italic"
        >
          React Strict DOM
        </Link>
        {' and '}
        <Link
          href={
            reactNativeVideoUrls['Reimagining Lists in React Native'].direct
          }
          target="_blank"
          rel="noopener"
          fontStyle="italic"
        >
          Reimagining Lists in React Native
        </Link>
        {'.'}
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(reactNativeVideoUrls).map(([title, urls]) => (
          <Grid key={title} size={{ xs: 12, sm: 6, md: 4 }}>
            <YoutubeIframe src={urls.embed} title={title} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default function Articles() {
  return (
    <>
      <MetaTags
        title="React Conf 2025 Highlights"
        description="React Conf 2025 Highlights written by Noah Tigner"
      />
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Divider>
          <img
            src="https://conf.react.dev/logo.svg"
            alt="React Conf Logo"
            width={400}
          />
        </Divider>
        <span>
          <Typography variant="h2" fontSize="2.5rem">
            2 Keynotes, 25 Talks, and 2 Days of React
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            x minutes &bull; October 12, 2025
          </Typography>
        </span>
        <SectionIntro />
        <SectionCompiler />
        <SectionReact19_2 />
        <H3>Coming Soon: React 19.3</H3>
        <Typography>...</Typography>
        <H4 className="code">{'ViewTransitions'}</H4>
        <Typography>...</Typography>
        <SectionReactNative />
        <Link component={RouterLink} to={paths.articles}>
          All Articles
        </Link>
      </div>
    </>
  );
}
