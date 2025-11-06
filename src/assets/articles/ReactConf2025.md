---
title: React Conf 2025 Highlights
description: A summary of my key takeaways from React Conf 2025. Topics include the new React Compiler, React 19.2, Activity, ViewTransitions, and more.
published: October 12, 2025
minutesToRead: 9
path: /articles/react-conf-2025/
image: /images/react-conf-2025.svg
tags:
  - 'react'
  - 'conference'
  - 'frontend'
---

## 2 Keynotes, 25 Talks, and 2 Days of React

###### 9 minute read • October 12, 2025

I was fortunate to attend <a href="https://conf.react.dev/agenda" target="_blank" rel="noopener">React Conf 2025</a> in Henderson, NV, and learn from the best in the React community. The conference boasted over 600 attendees and 250k+ livestream viewers. Over the course of 2 days, members of the React team shared their vision for the future of React, and the community gathered to discuss the latest trends in web development.

Perhaps the most important announcement for the long-term future of React was the creation of the <a href="https://react.dev/blog/2025/10/07/introducing-the-react-foundation" target="_blank" rel="noopener">React Foundation</a>. The foundation will maintain and govern React, React Native, JSX, and several other projects in the ecosystem. This move will bring more voices to the table as React continues to grow and evolve.

---

### React Compiler 1.0

On day one, Lauren Tan announced the official release of React Compiler v1.0, marking a significant milestone for React optimization. The compiler supports React 17, 18, and 19, providing automatic memoization without requiring developers to manually wrap components in `React.memo` or use `useMemo` and `useCallback`. What sets this compiler apart from existing linters and build tools is its deep understanding of your codebase, allowing it to make intelligent optimization decisions that were previously the developer's responsibility (and a common source of bugs).

The compiler is designed with incremental adoption in mind, with <a href="https://react.dev/learn/react-compiler/incremental-adoption" target="_blank" rel="noopener">comprehensive documentation</a> guiding teams through the migration process. Currently available as a Babel plugin, it integrates with popular build tools like <a href="https://react.dev/learn/react-compiler/installation#vite" target="_blank" rel="noopener">Vite</a>, making it accessible to most React projects. The performance improvements are substantial, with the <a href="https://react.dev/blog/2025/10/07/react-compiler-1#react-compiler-at-meta" target="_blank" rel="noopener">release announcement</a> boasting 2.5x faster interactions in some cases, without any added memory overhead.

#### eslint-plugin-react-hooks v7

Alongside the compiler, the React team released version 7 of <a href="https://react.dev/blog/2025/10/01/react-19-2#eslint-plugin-react-hooks" target="_blank" rel="noopener">eslint-plugin-react-hooks</a>. One of the new rules identifies components that the compiler cannot optimize, and will signal to the compiler that these components should be skipped. While the primary focus of these new rules is to assist with gradual adoption of the compiler, many of the rules are incredibly useful on their own. Rules such as `set-state-in-effect`, `set-state-in-render`, and `immutability` identify common pitfalls associated with `useState`, and rules such as `use-memo` and `refs` help developers steer clear of other common React mistakes. Note that the docs point to version 6, but <a href="https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/CHANGELOG.md#610" target="_blank" rel="noopener"> version 7 was released almost immediately</a> after the conference. To get access to all of these new rules, upgrade to v7 and use the `recommended-latest` configuration.

---

### The Future Is Now: React 19.2

React 19.2 introduces several exciting features aimed at improving both UX and DevEx. The React team put a strong emphasis on developer experience by introducing <a href="https://react.dev/reference/dev-tools/react-performance-tracks" target="_blank" rel="noopener">React Performance Tracks</a>, an expansion of Chrome DevTools for performance profiling. Coming soon is the "Suspense Tab" which will display when and why components suspended. The team also maintained the momentum around SSR and RSCs by introducing `cacheSignal()`, which tells you when the `cache()` lifetime of a RSC has ended, and <a href="https://react.dev/blog/2025/10/01/react-19-2#batching-suspense-boundaries-for-ssr" target="_blank" rel="noopener"> bug fixes to suspense boundaries in SSR</a>. The most notable new features include `<Activity />`, `useEffectEvent()`, and partial pre-rendering.

#### `<Activity />`

The new `<Activity />` component allows developers to declaratively pre-render and prioritize content. Components can be pre-rendered (and hidden) by setting the mode to `"hidden"`, and can then be revealed by changing the mode to `"visible"`. `"hidden"` hides the children, unmounts effects, and de-prioritizes updates, allowing things like images and data to be loaded in the background without blocking the more important `"visible"` content. Notably, state is persisted between mode changes. While these are the only two modes currently available, the team intends to add more in the future, hence calling the prop `mode` rather than `visible`. During a Q&A panel, the React team hinted that the next mode might be `"frozen"`, which might behave similarly to `"hidden"` but with the content still visible.

In practice, imagine a modal dialog meant to add items to a list. We _may_ still want updates to occur in the background, but render priority should be given to the modal's content. We can even optimistically pre-render the list with the new item in the background, and then reveal it when the user submits the action and closes the modal.

Another use case is for navigation. If there is a strong likelihood of users visiting page B after page A, we can pre-render page B in the background to reduce the navigation time, since data and assets such as css and images will already be loaded. This may prove especially useful for routing frameworks that do not already have built-in prefetching.

#### `useEffectEvent()`

The new `useEffectEvent` hook allows us to extract non-reactive logic out of events. Notably, functions within this hook see the latest props and state without the need for dependency arrays. These events are also stable and should not be included in the dependency arrays of the hooks that emit them (note that you will need the latest version of the eslint plugin described above to avoid warnings). The React docs have an excellent deep-dive into this new hook titled <a href="https://react.dev/learn/separating-events-from-effects#extracting-non-reactive-logic-out-of-effects" target="_blank" rel="noopener" class="ital">Extracting non-reactive logic out of Effects</a>. It has been described as "what `useCallback` should have been", but only for events that are dispatched from `useEffect` hooks.

#### Partial Pre-Rendering

Developers now have the ability to pre-render parts of their applications and resume rendering later. According to the <a href="https://react.dev/blog/2025/10/01/react-19-2#partial-pre-rendering" target="_blank" rel="noopener">announcement</a>, this "allows you to pre-render the static parts of your app and serve it from a CDN, and then resume rendering the shell to fill it in with dynamic content later." There are separate APIs for `react-dom/server` and `react-dom/static`.

---

### Coming Soon in React 19.3: `<ViewTransition />`

Animations? In React? With the power of `<ViewTransition />`, we can now declaratively manage animations natively in React. Simply wrapping a component in `<ViewTransition />` opts it in to these animations, which can then be triggered by either manually starting the transition via `startTransition()`, deferring values with `useDeferredValue()`, or by hitting a `<Suspense />` boundary. These animations can be styled with CSS, although the docs warn that this API is not intended to replace **all** animations.

The most impressive use case demonstrated at the conference was for animating page transitions. By leveraging `<ViewTransition />`, web developers can achieve some of the amazing transitions that are usually only seen on mobile devices. These transitions are composable and can be shared, and you can opt child components out of the transition by wrapping them in their own `<ViewTransition />` with a default of `none`. For example, you may want to animate the transition from one page to another with a "swipe" effect, but you won't want the next and back buttons to "swipe" along with the rest of the page.

Rick Hanlon of the React core team shared that while the combination of `<ViewTransition />`, `<Activity />`, `<Suspense />`, and `useOptimistic()` provide developers with a powerful toolkit for building fantastic and responsive UIs, the developer experience is not ideal. He shared that the team is committed to making it more clear when and where these tools should be used, and he encouraged routing and data-fetching library maintainers to integrate these tools in a way that is unintrusive to the application developer. His hopes are that the next generation of tooling will abstract away much of the complexity of these new APIs. You can see his wishlist & roadmap for the docs <a href="https://github.com/reactwg/async-react/discussions/2" target="_blank" rel="noopener">here</a>. He covered these topics in <a href="https://www.youtube.com/watch?v=zyVRg2QR6LA&t=10907s" target="_blank" rel="noopener" class="ital">Async React (part I)</a> and <a href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=29073s" target="_blank" rel="noopener" class="ital">Async React (part II)</a>. The codebase for the demo is available <a href="https://github.com/rickhanlonii/async-react" target="_blank" rel="noopener">here</a>, and the live application can be viewed <a href="https://async-react.dev/" target="_blank" rel="noopener">here</a>.

---

### Putting it all together: User Experience

Developers across the React ecosystem continue to raise the bar for UX, and several talks at this year's conference highlighted exciting new developments. Delba de Oliveira, a DX Engineer at Vercel, showcased how we can effectively leverage `<ViewTransition />` in her talk <a href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=20640s" target="_blank" rel="noopener" class="ital">Designing Page Transitions</a>. She walked through the process of implementing and styling smooth page transitions like the "swipe" effect described above. Michał Dudak from MUI shared tricks of the trade for building accessible and user-friendly components in his talk <a href="https://www.youtube.com/watch?v=zyVRg2QR6LA&t=23400s" target="_blank" rel="noopener" class="ital">The invisible craft of great UX</a>. He delved into the nuances of creating components for applications, component libraries, and entire design systems. He also provided an introduction to <a href="https://base-ui.com/" target="_blank" rel="noopener">Base UI</a>, a library of unstyled components from the makers of MUI, Radix, and Floating UI. It offers the flexibility of Radix and shadcn with the robustness and accessibility of Material UI.

---

### What is the framework of the future?

Finally, framework authors from across the React ecosystem shared the latest and greatest features coming to their projects. These talks included:

- <a href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=21350s" target="_blank" rel="noopener" class="ital">Build Fast, Deploy Faster — Expo in 2025</a>
- <a href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=22367s" target="_blank" rel="noopener" class="ital">The React Router's take on RSC</a>
- <a href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=24992s" target="_blank" rel="noopener" class="ital">RedwoodSDK: Web Standards Meet Full-Stack React</a>
- <a href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=26065s" target="_blank" rel="noopener" class="ital">TanStack Start</a>
- <a href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=5737s" target="_blank" rel="noopener" class="ital">React Native, Amplified</a>
- <a href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=18213s" target="_blank" rel="noopener" class="ital">React Everywhere: Bringing React Into Native Apps</a>
- <a href="https://www.youtube.com/watch?v=zyVRg2QR6LA&t=25521s" target="_blank" rel="noopener" class="ital">Modern Emails using React</a>
- <a href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=19538s" target="_blank" rel="noopener" class="ital">How Parcel Bundles React Server Components</a>

To wrap things up, Jack Herrington led a <a href="https://www.youtube.com/watch?v=p9OcztRyDl0&t=26812s" target="_blank" rel="noopener">Q&amp;A panel</a> with several of these framework maintainers, discussing the future of frameworks and the challenges they face.

---

### React Native

Since my focus is primarily on web development, the main focus of this article has been on the web-development side of React. However, this is an exciting time for mobile and cross-platform developers, and I encourage you to watch the <a href="https://www.youtube.com/live/p9OcztRyDl0?si=BFKnf9nEOp5rV-Wp&t=2289" target="_blank" rel="noopener" class="ital">React Native Keynote</a>, and the presentations on <a href="https://www.youtube.com/live/p9OcztRyDl0?si=Sji5bJSpCRiE8Avw&t=9040" target="_blank" rel="noopener" class="ital">React Strict DOM</a> and <a href="https://www.youtube.com/live/p9OcztRyDl0?si=3Xp8W9p7nwnsSrLX&t=10377" target="_blank" rel="noopener" class="ital">Reimagining Lists in React Native</a>.

---

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/zyVRg2QR6LA?si=Y3wCxLevjUF0Basz&amp"
        title="Video - React Conf 2025 Day 1"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/p9OcztRyDl0?si=3Xp8W9p7nwnsSrLX&amp"
        title="Video - React Conf 2025 Day 2"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>
