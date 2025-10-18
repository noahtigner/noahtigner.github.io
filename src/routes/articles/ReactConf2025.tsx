import { Link as RouterLink } from 'react-router';
import { Box, Divider, Grid, Link, Typography } from '@mui/material';

import MetaTags from '../../components/MetaTags';
import paths from '../../paths';
import {
  H3,
  H4,
  YoutubeIframe,
  H2,
  Subtitle,
  SectionDivider,
} from '../../components/Articles/ArticleTypography';
import type { Route } from '../+types/Articles';

const confImageUrl = '/images/react-conf-2025.svg';

// tell React-Router to preload images for this page
export const links: Route.LinksFunction = () => {
  return [
    {
      rel: 'preload',
      href: confImageUrl,
      as: 'image',
      type: 'image/webp',
      fetchPriority: 'low',
    },
  ];
};

const reactConfVideoUrls = [
  {
    title: 'React Conf 2025 Day 1',
    url: 'https://www.youtube.com/embed/zyVRg2QR6LA?si=Y3wCxLevjUF0Basz&amp',
  },
  {
    title: 'React Conf 2025 Day 2',
    url: 'https://www.youtube.com/embed/p9OcztRyDl0?si=3Xp8W9p7nwnsSrLX&amp',
  },
];

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
        <code>React.memo</code> or use <code>useMemo</code> and{' '}
        <code>useCallback</code>. What sets this compiler apart from existing
        linters and build tools is its deep understanding of your codebase,
        allowing it to make intelligent optimization decisions that were
        previously the developer&apos;s responsibility (and a common source of
        bugs).
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
        useful on their own. Rules such as <code>set-state-in-effect</code>,{' '}
        <code>set-state-in-render</code>, and <code>immutability</code> identify
        common pitfalls associated with <code>useState</code>, and rules such as{' '}
        <code>use-memo</code> and <code>refs</code> help developers steer clear
        of other common React mistakes. Note that the docs point to version 6,
        but{' '}
        <Link
          href="https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/CHANGELOG.md#610"
          target="_blank"
          rel="noopener"
        >
          version 7 was released almost immediately
        </Link>{' '}
        after the conference. To get access to all of these new rules, upgrade
        to v7 and use the <code>recommended-latest</code> configuration.
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
        , an expansion of Chrome DevTools for performance profiling. Coming soon
        is the &quot;Suspense Tab&quot; which will display when and why
        components suspended. The team also maintained the momentum around SSR
        and RSCs by introducing <code>cacheSignal()</code>, which tells you when
        the <code>cache()</code> lifetime of a RSC has ended, and{' '}
        <Link
          href="https://react.dev/blog/2025/10/01/react-19-2#batching-suspense-boundaries-for-ssr"
          target="_blank"
          rel="noopener"
        >
          bug fixes to suspense boundaries in SSR
        </Link>
        . The most notable new features include
        <code>{'<Activity />'}</code>, <code>useEffectEvent()</code>, and
        partial pre-rendering.
      </Typography>
      <H4 className="code">{'<Activity />'}</H4>
      <Typography>
        <code>{'<Activity />'}</code> is a new React component that allows
        developers to declaratively pre-render and prioritize content.
        Components can be pre-rendered (and hidden) by setting the mode to{' '}
        <code>&quot;hidden&quot;</code>, and can then be revealed by changing
        the mode to <code>&quot;visible&quot;</code>.{' '}
        <code>&quot;hidden&quot;</code> hides the children, unmounts effects,
        and de-prioritizes updates, allowing things like images and data to be
        loaded in the background without blocking the more important{' '}
        <code>&quot;visible&quot;</code> content. Notably, state is persisted
        between mode changes. While these are the only two modes currently
        available, the team intends to add more in the future, hence calling the
        prop <code>mode</code> rather than <code>visible</code>. During a
        Q&amp;A panel, the React team hinted that the next mode might be
        <code>&quot;frozen&quot;</code>, which might behave similarly to{' '}
        <code>&quot;hidden&quot;</code> but with the content still visible.
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
        for routing frameworks that do not already have built-in prefetching.
      </Typography>
      <H4 className="code">{'useEffectEvent()'}</H4>
      <Typography>
        The new <code>useEffectEvent()</code> hook allows us to extract
        non-reactive logic out of events. Notably, functions within this hook
        see the latest props and state without the need for dependency arrays.
        These events are also stable and should not be included in the
        dependency arrays of the hooks that emit them (note that you will need
        the latest version of the eslint plugin described above to avoid
        warnings). The React docs have an excellent deep-dive into this new hook
        titled{' '}
        <Link
          href="https://react.dev/learn/separating-events-from-effects#extracting-non-reactive-logic-out-of-effects"
          target="_blank"
          rel="noopener"
        >
          <em>Extracting non-reactive logic out of Effects</em>
        </Link>
        .
      </Typography>
      <H4>Partial Pre-Rendering</H4>
      <Typography>
        Developers now have the ability to pre-render parts of their
        applications and resume rendering later. According to the{' '}
        <Link
          href="https://react.dev/blog/2025/10/01/react-19-2#partial-pre-rendering"
          target="_blank"
          rel="noopener"
        >
          announcement
        </Link>
        , this &quot;allows you to pre-render the static parts of your app and
        serve it from a CDN, and then resume rendering the shell to fill it in
        with dynamic content later.&quot; There are separate APIs for{' '}
        <code>react-dom/server</code> and <code>react-dom/static</code>.
      </Typography>
    </>
  );
}

function SectionReact19_3() {
  return (
    <>
      <H3>
        Coming Soon in React 19.3: <code>{'<ViewTransition />'}</code>
      </H3>
      <Typography>
        Animations? In React? With the power of
        <code>{'<ViewTransition />'}</code>, we can now declaratively manage
        animations natively in React. Simply wrapping a component in{' '}
        <code>{'<ViewTransition />'}</code>
        opts it in to these animations, which can then be triggered by either
        manually starting the transition via <code>startTransition()</code>,
        deferring values with <code>useDeferredValue()</code>, or by hitting a
        <code>{'<Suspense />'}</code> boundary. These animations can be styled
        with CSS, although the docs warn that this API is not intended to
        replace <strong>all</strong> animations.
      </Typography>
      <Typography>
        The most impressive use case demonstrated at the conference was for
        animating page transitions. By leveraging
        <code>{'<ViewTransition />'}</code>, web developers can achieve some of
        the amazing transitions that are usually only seen on mobile devices.
        These transitions are composable and can be shared, and you can opt
        child components out of the transition by wrapping them in their own{' '}
        <code>{'<ViewTransition />'}</code> with a default of <code>none</code>.
        For example, you may want to animate the transition from one page to
        another with a &quot;swipe&quot; effect, but you won&apos;t want the
        next and back buttons to &quot;swipe&quot; along with the rest of the
        page.
      </Typography>
      <Typography>
        Rick Hanlon of the React core team shared that while the combination of{' '}
        <code>{'<ViewTransition />'}</code>, <code>{'<Activity />'}</code>,{' '}
        <code>{'<Suspense />'}</code>, and <code>{'useOptimistic()'}</code>{' '}
        provide developers with a powerful toolkit for building fantastic and
        responsive UIs, the developer experience is not ideal. He shared that
        the team is committed to making it more clear when and where these tools
        should be used, and he encouraged routing and data-fetching library
        maintainers to integrate these tools in a way that is unintrusive to the
        application developer. His hopes are that the next generation of tooling
        will abstract away much of the complexity of these new APIs. You can see
        his wishlist &amp; roadmap for the docs{' '}
        <Link
          href="https://github.com/reactwg/async-react/discussions/2"
          target="_blank"
          rel="noopener"
        >
          here
        </Link>
        .{' '}
        <Link
          href="https://www.youtube.com/watch?v=zyVRg2QR6LA&t=10907s"
          target="_blank"
          rel="noopener"
        >
          Async React (pt. I)
        </Link>{' '}
        and{' '}
        <Link
          href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=29073s"
          target="_blank"
          rel="noopener"
        >
          Async React (pt. II)
        </Link>{' '}
        are his talks on these features. The codebase for the demo is available{' '}
        <Link
          href="https://github.com/rickhanlonii/async-react"
          target="_blank"
          rel="noopener"
        >
          here
        </Link>
        {', '} and the live application can be viewed{' '}
        <Link href="https://async-react.dev/" target="_blank" rel="noopener">
          here
        </Link>
        .
      </Typography>
    </>
  );
}

function SectionReactNative() {
  return (
    <>
      <H3>React Native</H3>
      <Typography>
        Since my focus is primarily on web development, the main focus of this
        article has been on the web-development side of React. However, this is
        an exciting time for mobile and cross-platform developers, and I
        encourage you to watch the{' '}
        <Link
          href="https://www.youtube.com/live/p9OcztRyDl0?si=BFKnf9nEOp5rV-Wp&t=2289"
          target="_blank"
          rel="noopener"
        >
          React Native Keynote
        </Link>
        {', '} and the presentations on{' '}
        <Link
          href="https://www.youtube.com/live/p9OcztRyDl0?si=Sji5bJSpCRiE8Avw&t=9040"
          target="_blank"
          rel="noopener"
          fontStyle="italic"
        >
          React Strict DOM
        </Link>
        {' and '}
        <Link
          href="https://www.youtube.com/live/p9OcztRyDl0?si=3Xp8W9p7nwnsSrLX&t=10377"
          target="_blank"
          rel="noopener"
          fontStyle="italic"
        >
          Reimagining Lists in React Native
        </Link>
        {'.'}
      </Typography>
    </>
  );
}

function SectionVideos() {
  return (
    <Grid container spacing={2}>
      {reactConfVideoUrls.map((video) => (
        <Grid key={video.title} size={{ xs: 12, sm: 6 }}>
          <YoutubeIframe src={video.url} title={video.title} />
        </Grid>
      ))}
    </Grid>
  );
}

function LogoDivider() {
  return (
    <Divider sx={{ marginY: { xs: 0, md: 4 } }}>
      <Box
        component="img"
        src={confImageUrl}
        alt="React Conf Logo"
        sx={{
          height: { xs: 60, md: 100 },
          // width: 'auto',
        }}
      />
    </Divider>
  );
}

export default function Articles() {
  return (
    <>
      <MetaTags
        title="React Conf 2025 Highlights"
        description="React Conf 2025 Highlights by Noah Tigner"
      />
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <LogoDivider />
        <span>
          <H2>2 Keynotes, 25 Talks, and 2 Days of React</H2>
          <Subtitle>8 minute read &bull; October 12, 2025</Subtitle>
        </span>
        <SectionIntro />
        <SectionDivider />
        <SectionCompiler />
        <SectionDivider />
        <SectionReact19_2 />
        <SectionDivider />
        <SectionReact19_3 />
        <SectionDivider />
        <SectionReactNative />
        <SectionDivider />
        <SectionVideos />
        <Link component={RouterLink} to={paths.articles}>
          &lt; All Articles
        </Link>
      </span>
    </>
  );
}
