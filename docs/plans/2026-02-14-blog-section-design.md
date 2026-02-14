# Blog Section Design

## Overview

Add a blog section to scarlet.engineering for posting devlogs. Uses Eleventy (11ty) to generate blog pages from Markdown files. The existing landing page (`index.html`) remains untouched.

## Writing Workflow

1. Create a new `.md` file in `blog/posts/`
2. Add frontmatter (title, date, description, image)
3. Write content in Markdown
4. Push to `main` — GitHub Actions builds and deploys automatically

### Post Frontmatter

```yaml
---
title: Hello World
date: 2026-02-14
description: My first devlog post
image: /blog/images/hello-world.png
---
```

- `image` is optional; falls back to a site-wide default OG image
- `description` is used for `og:description` and the HTML meta description

## Project Structure

```
scarlet.engineering/
├── index.html                # Untouched, passed through as-is
├── blog/
│   ├── blog.njk              # Blog list page template
│   ├── post.njk              # Individual post template
│   └── posts/
│       └── *.md              # Blog posts (Markdown)
├── _includes/
│   └── blog-base.njk         # Shared HTML wrapper (head, styles, footer)
├── .eleventy.js              # Eleventy config
├── package.json              # eleventy dependency
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions build + deploy
├── _site/                    # Build output (gitignored)
└── ... existing files ...
```

## Eleventy Configuration

- Input: `.` (project root)
- Output: `_site/`
- `index.html` and all existing static assets (images, CNAME, favicon) passed through verbatim
- Only `.njk` and `.md` files in `blog/` are processed
- Blog posts use `post.njk` layout via directory data file or frontmatter

## URL Structure

- `/blog/` — blog list page
- `/blog/post-slug/` — individual posts (slug derived from filename)

## Templates

### blog-base.njk

Shared HTML shell for all blog pages:
- `<head>` with meta charset, viewport, OG tags, font loading
- Reuses the same CSS variables and fonts as the landing page
- Dark background (#1A1A1A), parchment text (#E8E0D0)

### blog.njk (list page)

- "Blog" heading in Alfa Slab One
- Posts listed in reverse chronological order
- Each entry: title (linked) + date
- Centered column, max-width ~720px

### post.njk (individual post)

- Post title in Alfa Slab One
- Date below title in fog color (#9A9A8E)
- Body in Cormorant Garamond, comfortable reading size
- Styled Markdown elements: headings, code blocks, links, images, lists, blockquotes
- Code blocks in JetBrains Mono
- Links in gaslight gold (#D4A857) with hover transition
- "Back to blog" link

### OG Meta Tags (per post)

- `og:title` — post title
- `og:description` — from frontmatter description
- `og:image` — from frontmatter image, falls back to site default
- `og:type` — article
- `og:url` — canonical URL

## Landing Page Change

Add a "Blog" link to `index.html`, styled consistently with the existing social links section.

## Build & Deploy

### Dependencies

- `@11ty/eleventy` (sole dependency)

### package.json Scripts

- `npm run build` — builds site to `_site/`
- `npm run dev` — local dev server with hot reload

### GitHub Actions Workflow

- Trigger: push to `main`
- Steps: checkout, install Node, `npm ci`, `npm run build`, deploy `_site/` to GitHub Pages

### .gitignore Additions

- `_site/`
- `node_modules/`

## Styling Summary

Matches the landing page aesthetic:
- Dark background (ink #1A1A1A)
- Parchment text (#E8E0D0)
- Alfa Slab One headings
- Cormorant Garamond body text
- Gaslight gold links (#D4A857)
- 2px border-radius, 0.2s transitions
- Max-width ~720px centered content column
