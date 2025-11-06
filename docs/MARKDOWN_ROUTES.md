# Automatic Markdown Route Generation

This project now supports automatic route generation and prerendering for markdown articles.

## How It Works

The application automatically:

1. Scans all `.md` files in `src/assets/articles/`
2. Reads their frontmatter to extract the `path` attribute
3. Creates routes dynamically at build time
4. Prerenders each article as static HTML

## Adding a New Article

To add a new article, simply create a new markdown file in `src/assets/articles/` with the required frontmatter:

```markdown
---
title: Your Article Title
description: A brief description of your article
published: October 22, 2025 # or null for unpublished
minutesToRead: 5
path: /articles/your-article-slug
image: /images/your-article-image.svg
tags:
  - 'tag1'
  - 'tag2'
---

## Your Article Content

Write your article content here using markdown...
```

## Required Frontmatter Fields

- `title` (string): The title of your article
- `description` (string): A brief description
- `published` (string | null): Publication date or null if unpublished
- `minutesToRead` (number): Estimated reading time in minutes
- `path` (string): The URL path for the article (should start with `/articles/`)
- `image` (string): Path to the article's header image
- `tags` (array of strings): Tags for categorization

## Benefits

- **No manual route configuration**: Just add a markdown file and the route is created automatically
- **Automatic prerendering**: Each article is prerendered as static HTML at build time
- **Type safety**: Article metadata is validated using Zod schemas
- **Dynamic imports**: Article content is lazy-loaded for optimal performance
- **SEO friendly**: Each article gets its own prerendered HTML page

## Technical Implementation

The solution uses:

- **Dynamic route parameter** (`/articles/:slug`) to match all article paths
- **Lazy loading** via `React.lazy()` for efficient code splitting
- **Build-time path discovery** in `react-router.config.ts` to enable prerendering
- **Module-level component initialization** to satisfy ESLint's `static-components` rule
