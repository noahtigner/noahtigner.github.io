---
title: 'Github Pages: Custom 404 Page with React Router'
description: TODO
published:
minutesToRead: 10
path: /articles/github-pages-404-react-router
image: /images/404-page.png
tags:
  - 'react'
  - 'github'
  - '404'
---

## Creating a custom Github Pages 404 page with React Router

###### 10 minute read • November 3, 2025

<a href="https://docs.github.com/en/pages/quickstart" target="_blank" rel="noopener">Github Pages</a> is one of the most straightforward ways of hosting a static website for free. With <a href="https://github.com/actions/upload-pages-artifact" target="_blank" rel="noopener" class="ital">upload-pages-artifact</a> and <a href="https://github.com/actions/deploy-pages" target="_blank" rel="noopener"  class="ital">deploy-pages</a>, developers can commit and merge their changes and have them deployed in minutes or even seconds. This makes Github Pages an obvious choice for deploying and hosting Single-Page Applications (SPAs) built with React.

### The Problem: Routing

The most commonly faced issue when deploying React applications to Github Pages stems from routing. Many users find that while React Router's client-side routing works well locally, it is not necessarily supported by Github Pages. Most client-side routing libraries require that all page requests are sent to _index.html_, which is not supported by Github Pages. Instead, requesting any route other than the index will result in a 404.

### Legacy Workarounds

Prior to React Router v6.4, the most common workaround was to use a `HashRouter`, which was heavily discouraged in the <a href="https://reactrouter.com/6.30.1/router-components/hash-router" target="_blank" rel="noopener">v6 documentation</a>:

> [!WARNING]
> "We strongly recommend you do not use `HashRouter` unless you absolutely have to."

React Router v6.4 introduced the <a href="https://reactrouter.com/6.30.1/routers/picking-a-router#data-apis" target="_blank" rel="noopener" class="ital">Data APIs</a>, which included `route.loader`, `route.action`, route-based lazy-loading, and more than a dozen hooks. To leverage these, users had to migrate to a "data router" such as `createBrowserRouter` or `createMemoryRouter`. The docs recommend that all projects use `createBrowserRouter`, but many static hosting platforms (including Github Pages) will force developers to use `createHashRouter` instead.

Both `HashRouter` and `createHashRouter` are suboptimal for several reasons. Using the hash portion of the URL for routing can have a negative impact on SEO. Using the URL hash in this manner can conflict with its intended uses, such as for navigating to specific parts of a given page via the <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/hash" target="_blank" rel="noopener">anchor hash</a>. In my subjective opinion, seeing hash-routing in the wild is often a dead giveaway that an app is using outdated APIs and techniques.

### React Router v7

React Router v7 (A.K.A Remix v3) offers three strategies or <a href="https://reactrouter.com/start/modes" target="_blank" rel="noopener">"modes"</a> for routing. The modes are called "Declarative", "Data", and "Framework", with each successively adding more features. "Declarative" mode will be the most easily recognizable to users of prior versions of React Router, offering the fewest features but the easiest configuration. "Data" mode mirrors the additions made in v6.4, offering loaders, actions, etc. "Framework" mode, while the most opinionated, offers the most features, many of which are entirely new to React Router. Within "Framework" mode, users have <a href="https://reactrouter.com/start/framework/rendering" target="_blank" rel="noopener">three rendering strategies</a> to choose from: client-side rendering, server-side rendering, and static pre-rendering.

Of these three rendering strategies, we can immediately rule out server-side rendering, since Github Pages does not support SSR. Client-side rendering is of course supported, but will lead to the same routing pitfalls described above. Static Pre-rendering is the answer to all (or at least most) of our problems.

#### Static Pre-Rendering with v7's Framework Mode

Static pre-rendering allows us to build individual routes / pages at build time, meaning that the development process feels like that of a React SPA, but the end result includes multiple discrete html files which are easily consumable by static hosts like Github Pages. Static pre-rendering "solves" many of the problems commonly associated with SPAs. <a href="https://reactrouter.com/start/framework/rendering#static-pre-rendering" target="_blank" rel="noopener">The React Router docs</a> describe it as:

> "... a build-time operation that generates static HTML and client navigation data payloads for a list of URLs. This is useful for SEO and performance, especially for deployments without server rendering. When pre-rendering, route module loaders are used to fetch data at build time."

While the docs describe static pre-rendering as a third rendering strategy, it can be used in combination with client-rendered SPAs or SSR. It is also worth noting that pre-rendered routes can leverage some of React Router's SSR APIs that would not otherwise be available to non-SSR'd apps.

> [!TIP]
> While an over-simplification, it can be helpful to think of static pre-rendering as build-time SSR.

### Getting Started

This article assumes you have a working React application using React Router v7 in "Framework" mode. If you are starting a new project, consider following the <a href="https://reactrouter.com/tutorials/address-book" target="_blank" rel="noopener" class="ital">Address Book</a> example in the docs. For the purposes of this article, our starting point should be an app with SSR disabled. The _react-router-config.ts_ should look something like this:

```typescript
import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
} satisfies Config;
```

We can then tell React Router to pre-render our pages by supplying a `prerender` value. Setting `prerender` to `true` pre-renders all routes found in your _routes.ts_ file. For more granularity, set the value to a list of route path strings. For even more flexibility, provider a function that returns a list of route path strings. This can be useful if you need to list the files in a directory, asynchronously fetch items from a CMS or DB, or perform other complex build-time logic.

```typescript
import type { Config } from '@react-router/dev/config';
import { getArticlePaths } from './articles/utils';

const paths = {
  home: '/',
  articles: '/articles',
  article: '/articles/:slug',
};

export default {
  ssr: false,
  // prerender: true,
  // prerender: ['/', '/articles'],
  async prerender() {
    // exclude dynamic routes like /articles/:slug
    const nonSlugPaths = Object.values(paths).filter(
      (p) => !p.includes(':') && !p.includes('*')
    );
    // asynchronously get dynamic article paths
    const articlePaths = await getArticlePaths();
    // deduplicate paths
    const deduped = new Set([...nonSlugPaths, ...articlePaths]);
    return Array.from(deduped);
  },
} satisfies Config;
```

> [!WARNING]
> Even though Framework mode leverages Vite, it seems that certain Vite APIs and plugins do not behave as expected when used within `prerender` or executed directly in this file. For example, users have reported not being able to import .md files with `import.meta.glob` in <a href="https://github.com/remix-run/react-router/issues/12155" target="_blank" rel="noopener">this issue</a>. I have personally observed that _vite-plugin-markdown_ does not work within this file, and have had to fall back to the Node's _fs_ and _path_ modules.
