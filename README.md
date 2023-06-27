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
- [ ] Remove Vite placeholders
- [x] Set up basic SEO and meta info
  - [x] Set up meta tags
  - [x] Set up [Open Graph Protocol](https://ogp.me/) (OGP) tags and preview image. [Open Graph Debugger](https://www.opengraph.xyz/url/https%3A%2F%2Fwww.noahtigner.com%2F)
- [x] Choose color palette and font family
- [x] Configure UI Library
  - [x] Choose Library
    - [Material UI](https://material-ui.com/) :white_check_mark:
    - ~~Chakra UI~~
    - ~~Mantine~~
    - ~~Tailwind~~
  - [x] Configure
- [ ] Build UI
  - [ ] Intro or Hero section
  - [ ] `Card` component for portfolio items
  - [x] `Timeline` component for experience / work history
  - [x] Contact Section
    - [x] Contact Dropdown
    - [x] Contact Footer
- [ ] Optimization
  - [ ] skeletons for sections and components
  - [ ] optimize images
  - [ ] lazy-load sections
  - [ ] lazy-load images
- [ ] Pull data from Github???
- [ ] Test
  - [ ] Unit / Component Testing
  - [ ] Accessibility Testing

## Available Scripts:

- `npm run dev` - Runs the app in the development mode.
- `npm run build` - Builds the app for production to the `dist` folder.
- `npm run preview` - Serves the production build from the `dist` folder.
- `npm run lint` - Checks the source code for linting issues.
- `npm run lint:fix` - Checks the source code for linting issues and fixes as many as possible.
- `npm run format` - Checks the source code for formatting issues.
- `npm run format:fix` - Checks the source code for formatting issues and fixes as many as possible.
- `npm run test` - Runs Vitest and outputs a coverage report.
