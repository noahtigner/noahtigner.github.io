# noahtigner.github.io

Noah Tigner's [Portfolio Website](https://noahtigner.com)

## Checklist:

- [x] Scaffold React / TypeScript project with Vite
- [x] Configure Prettier
- [x] Configure ESLint
- [x] Configure Vitest
- [x] Add new scripts to package.json & README
- [x] Configure Husky pre-commit hooks
- [x] Configure CICD for Github Pages
  - [x] [quality.yml](https://github.com/noahtigner/noahtigner.github.io/blob/main/.github/workflows/quality.yml): Checks formatting, lints, and tests code
  - [x] [codeql.yml](https://github.com/noahtigner/noahtigner.github.io/blob/main/.github/workflows/codeql.yml): Checks for security vulnerabilities
  - [x] [dependabot.yml](https://github.com/noahtigner/noahtigner.github.io/blob/main/.github/dependabot.yml): Checks for outdated dependencies
  - [x] [deploy.yml](https://github.com/noahtigner/noahtigner.github.io/blob/main/.github/workflows/deploy.yml): Builds and deploys to Github Pages
- [x] Remove Vite placeholders
- [x] Set up basic SEO and meta info
  - [x] Set up meta tags
  - [x] Set up [Open Graph Protocol](https://ogp.me/) (OGP) tags and preview image. [Open Graph Debugger](https://www.opengraph.xyz/url/https%3A%2F%2Fwww.noahtigner.com%2F)
  - [x] Semantic HTML & ARIA roles
  - [x] Sitemap Generation
  - [x] webp images
- [x] Choose color palette and font family
- [x] Design System / Component Library
  - [Material UI](https://material-ui.com/) :white_check_mark: -> [Base UI](https://base-ui.com/react/overview/quick-start) :white_check_mark:
  - ~~Chakra UI~~
  - ~~Mantine~~
  - ~~Tailwind~~
- [ ] Build UI
  - [ ] Intro or Hero section
  - [x] `Card` component for portfolio items
  - [x] `Timeline` component for experience / work history
  - [x] Contact Section
    - [x] Contact Dropdown
    - [x] Contact Footer
- [ ] Optimization
  - [ ] skeletons for sections and components
  - [x] optimize images
  - [x] lazy-load ~~sections~~ routes
  - [x] lazy-load images
  - [x] Prefetch important routes when certain links are rendered
- [x] Telemetry & Analytics
- [x] Custom 404 Page (that works with Github Pages)
  - [x] Redirect invalid routes to 404 page
- [x] Blog / Articles
  - [x] Markdown support
  - [x] Components:
    - [x] Basic components (Headings, Paragraphs, Lists, Links, Images)
    - [x] Quotes / Callouts
    - [x] Syntax highlighting for code blocks w/ MakrdownIt + Highlight.js
  - [ ] Tags / Categories
  - [x] Server-side generation of article pages
- [ ] Pull data from Github???
- [ ] Test
  - [ ] Unit / Component Testing
  - [ ] Accessibility Testing

## Articles / Blog Posts:

- [x] [Creating a Custom Github Pages 404 Page with React Router v7's Framework Mode](https://noahtigner.com/articles/github-pages-404-react-router/)
- [x] [React Conf 2025 Highlights](https://noahtigner.com/articles/react-conf-2025/)
- [ ] Notes on Alex Petrov's _Database Internals_:
  - [x] [Chapter 1 - Introduction & Overview](https://noahtigner.com/articles/database-internals-chapter-1/)
  - [x] [Chapter 2 - B-Tree Basics](https://noahtigner.com/articles/database-internals-chapter-2/)
  - [x] [Chapter 3 - File Formats](https://noahtigner.com/articles/database-internals-chapter-3/)
  - [x] [Chapter 4 - Implementing B-Trees](https://noahtigner.com/articles/database-internals-chapter-4/)
  - [x] [Chapter 5 - Transaction Processing and Recovery](https://noahtigner.com/articles/database-internals-chapter-5/)
  - [x] [Chapter 6 - B-Tree Variants](https://noahtigner.com/articles/database-internals-chapter-6/)

## Available Scripts:

- `pnpm dev` - Runs the app in the development mode.
- `pnpm build` - Builds the app for production to the `dist` folder.
- `pnpm preview` - Serves the production build from the `dist` folder.
- `pnpm lint` - Checks the source code for linting issues.
- `pnpm lint:fix` - Checks the source code for linting issues and fixes as many as possible.
- `pnpm format` - Checks the source code for formatting issues.
- `pnpm format:fix` - Checks the source code for formatting issues and fixes as many as possible.
- `pnpm test` - Runs Vitest and outputs a coverage report.
