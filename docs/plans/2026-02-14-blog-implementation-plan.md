# Blog Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an Eleventy-powered blog section that generates pages from Markdown, matching the existing dark Victorian aesthetic, deployed via GitHub Actions.

**Architecture:** Eleventy processes `blog/` directory Markdown/Nunjucks files into HTML. Existing `index.html` and static assets pass through untouched. GitHub Actions builds on push to `main` and deploys `_site/` to GitHub Pages.

**Tech Stack:** Eleventy 3.x, Nunjucks templates, GitHub Actions, GitHub Pages

---

### Task 1: Scaffold build tooling

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.eleventy.js`

**Step 1: Create package.json**

```json
{
  "name": "scarlet-engineering",
  "private": true,
  "scripts": {
    "build": "npx @11ty/eleventy",
    "dev": "npx @11ty/eleventy --serve"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0"
  }
}
```

**Step 2: Create .gitignore**

```
_site/
node_modules/
```

**Step 3: Create .eleventy.js**

The config must:
- Set input to `.` and output to `_site`
- Pass through `index.html`, all image files (`*.png`, `*.webp`, `*.svg`), `CNAME`, `favicon.*`, `scarlet-engineering-design-system.html`
- Only process Nunjucks/Markdown in `blog/` and `_includes/`
- Strip `blog/posts` from the output permalink so posts land at `/blog/<slug>/`

```js
module.exports = function(eleventyConfig) {
  // Pass through existing static files untouched
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("scarlet-engineering-design-system.html");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.webp");
  eleventyConfig.addPassthroughCopy("*.svg");
  eleventyConfig.addPassthroughCopy("blog/images");

  // Blog post collection sorted by date descending
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("blog/posts/**/*.md").sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    }
  };
};
```

**Step 4: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` generated

**Step 5: Run build to verify passthrough works**

Run: `npx @11ty/eleventy`
Expected: Build succeeds. `_site/index.html` exists and is identical to source `index.html`. No errors.

**Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore .eleventy.js
git commit -m "feat: scaffold eleventy build tooling"
```

---

### Task 2: Create blog base template

**Files:**
- Create: `_includes/blog-base.njk`

**Step 1: Create the shared HTML wrapper**

This template provides the `<html>`, `<head>`, and `<body>` shell for all blog pages. It includes:
- Meta charset, viewport
- OG meta tags (title, description, image, type, url) using template variables
- Same Google Fonts loading strategy as landing page (async with noscript fallback)
- CSS variables matching landing page `:root`
- Blog-specific styles: centered content column (max-width 720px), typography for Markdown elements

```njk
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }} - scarlet.engineering</title>
    <meta name="description" content="{{ description or 'scarlet.engineering blog' }}">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">

    <!-- Open Graph -->
    <meta property="og:type" content="{{ ogType or 'website' }}">
    <meta property="og:url" content="https://scarlet.engineering{{ page.url }}">
    <meta property="og:title" content="{{ title }} - scarlet.engineering">
    <meta property="og:description" content="{{ description or 'scarlet.engineering blog' }}">
    <meta property="og:image" content="{{ image or 'https://scarlet.engineering/logo-v2.png' }}">

    <!-- Fonts (non-render-blocking) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Cormorant+Garamond:wght@300;400;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript><link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Cormorant+Garamond:wght@300;400;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet"></noscript>

    <style>
        :root {
            --color-alizarin: #7B1818;
            --color-claret: #6E2233;
            --color-madder: #A04040;
            --color-oxblood: #4A0000;
            --color-ink: #1A1A1A;
            --color-soot: #3D3D3D;
            --color-fog: #9A9A8E;
            --color-parchment: #E8E0D0;
            --color-gaslight: #D4A857;
            --color-verdigris: #4A766E;
            --font-heading: 'Alfa Slab One', 'Rockwell', serif;
            --font-body: 'Cormorant Garamond', 'Georgia', serif;
            --font-mono: 'JetBrains Mono', 'Consolas', monospace;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background-color: var(--color-ink);
            font-family: var(--font-body);
            font-size: 18px;
            line-height: 1.8;
            color: var(--color-parchment);
        }

        .blog-container {
            max-width: 720px;
            margin: 0 auto;
            padding: 60px 24px;
        }

        .blog-nav {
            margin-bottom: 48px;
        }

        .blog-nav a {
            color: var(--color-gaslight);
            text-decoration: none;
            font-family: var(--font-body);
            font-size: 1rem;
            transition: color 0.2s ease;
        }

        .blog-nav a:hover {
            color: var(--color-parchment);
        }

        h1, h2, h3, h4 {
            font-family: var(--font-heading);
            color: var(--color-parchment);
            line-height: 1.3;
        }

        h1 { font-size: 2rem; margin-bottom: 16px; }
        h2 { font-size: 1.5rem; margin-top: 48px; margin-bottom: 16px; }
        h3 { font-size: 1.25rem; margin-top: 32px; margin-bottom: 12px; }

        a { color: var(--color-gaslight); transition: color 0.2s ease; }
        a:hover { color: var(--color-parchment); }

        p { margin-bottom: 1.2em; }

        ul, ol {
            margin-bottom: 1.2em;
            padding-left: 1.5em;
        }

        li { margin-bottom: 0.4em; }

        blockquote {
            border-left: 3px solid var(--color-alizarin);
            padding-left: 20px;
            margin: 1.5em 0;
            color: var(--color-fog);
            font-style: italic;
        }

        code {
            font-family: var(--font-mono);
            font-size: 0.85em;
            background: var(--color-soot);
            padding: 2px 6px;
            border-radius: 2px;
        }

        pre {
            background: var(--color-soot);
            padding: 16px 20px;
            border-radius: 2px;
            overflow-x: auto;
            margin-bottom: 1.5em;
            border: 1px solid #4A4A4A;
        }

        pre code {
            background: none;
            padding: 0;
            font-size: 0.85em;
            line-height: 1.6;
        }

        img {
            max-width: 100%;
            height: auto;
            border-radius: 2px;
            margin: 1.5em 0;
        }

        hr {
            border: none;
            border-top: 1px solid var(--color-soot);
            margin: 2em 0;
        }

        @media (max-width: 480px) {
            body { font-size: 16px; }
            .blog-container { padding: 32px 16px; }
            h1 { font-size: 1.5rem; }
            h2 { font-size: 1.25rem; }
        }
    </style>
</head>
<body>
    <div class="blog-container">
        {{ content | safe }}
    </div>
</body>
</html>
```

**Step 2: Run build to verify template parses**

Run: `npx @11ty/eleventy`
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add _includes/blog-base.njk
git commit -m "feat: add blog base template with shared styles"
```

---

### Task 3: Create blog list page and post template

**Files:**
- Create: `blog/blog.njk`
- Create: `blog/post.njk`
- Create: `blog/posts/posts.json` (directory data file)

**Step 1: Create directory data file for posts**

This tells Eleventy that all Markdown files in `blog/posts/` use the `post.njk` layout and sets permalink structure.

`blog/posts/posts.json`:
```json
{
  "layout": "blog/post.njk",
  "permalink": "/blog/{{ page.fileSlug }}/"
}
```

**Step 2: Create post template**

`blog/post.njk`:
```njk
---
layout: blog-base.njk
ogType: article
---
<nav class="blog-nav">
    <a href="/blog/">&larr; Back to blog</a>
</nav>
<article>
    <header>
        <h1>{{ title }}</h1>
        <time style="color: var(--color-fog); font-size: 0.9rem;">{{ date | dateDisplay }}</time>
    </header>
    <div style="margin-top: 32px;">
        {{ content | safe }}
    </div>
</article>
```

Note: `dateDisplay` is a custom filter we need to add to `.eleventy.js`:

```js
eleventyConfig.addFilter("dateDisplay", (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
});
```

**Step 3: Create blog list page**

`blog/blog.njk`:
```njk
---
layout: blog-base.njk
title: Blog
permalink: /blog/
---
<nav class="blog-nav">
    <a href="/">&larr; Home</a>
</nav>
<h1>Blog</h1>
<div style="margin-top: 32px;">
    {%- for post in collections.posts %}
    <article style="margin-bottom: 32px;">
        <a href="{{ post.url }}" style="text-decoration: none;">
            <h2 style="margin-top: 0; font-size: 1.25rem;">{{ post.data.title }}</h2>
        </a>
        <time style="color: var(--color-fog); font-size: 0.85rem;">{{ post.date | dateDisplay }}</time>
    </article>
    {%- endfor %}
    {%- if collections.posts.length == 0 %}
    <p style="color: var(--color-fog);">No posts yet.</p>
    {%- endif %}
</div>
```

**Step 4: Update .eleventy.js with dateDisplay filter**

Add before the `return` statement:

```js
eleventyConfig.addFilter("dateDisplay", (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
});
```

**Step 5: Run build to verify templates work**

Run: `npx @11ty/eleventy`
Expected: Build succeeds. `_site/blog/index.html` exists (the list page).

**Step 6: Commit**

```bash
git add blog/blog.njk blog/post.njk blog/posts/posts.json .eleventy.js
git commit -m "feat: add blog list page and post template"
```

---

### Task 4: Create sample blog post and verify end-to-end

**Files:**
- Create: `blog/posts/2026-02-14-hello-world.md`
- Create: `blog/images/` directory (for future post images)

**Step 1: Create sample post**

`blog/posts/2026-02-14-hello-world.md`:
```markdown
---
title: Hello World
date: 2026-02-14
description: The first devlog post from scarlet.engineering
image: https://scarlet.engineering/logo-v2.png
---

This is the first devlog post. More to come.
```

**Step 2: Create blog images directory**

Run: `mkdir -p blog/images`

Create `blog/images/.gitkeep` (empty file to track the directory).

**Step 3: Run build and verify**

Run: `npx @11ty/eleventy`

Expected:
- `_site/blog/index.html` — list page with "Hello World" entry
- `_site/blog/hello-world/index.html` — the post page
- `_site/index.html` — landing page, identical to source

Verify the post page:
Run: `grep -c "og:title" _site/blog/hello-world/index.html`
Expected: `1`

Run: `grep "og:image" _site/blog/hello-world/index.html`
Expected: line containing `https://scarlet.engineering/logo-v2.png`

**Step 4: Run dev server and visually check**

Run: `npx @11ty/eleventy --serve`

Check in browser:
- `http://localhost:8080/` — landing page looks normal
- `http://localhost:8080/blog/` — blog list shows "Hello World"
- `http://localhost:8080/blog/hello-world/` — post renders with correct styling

Stop the server after visual check.

**Step 5: Commit**

```bash
git add blog/posts/2026-02-14-hello-world.md blog/images/.gitkeep
git commit -m "feat: add sample blog post and images directory"
```

---

### Task 5: Add blog link to landing page

**Files:**
- Modify: `index.html` (add one link after the email social link, before the games section)

**Step 1: Add blog link**

After the email link (`</a>` on line ~393) and before `<section class="games-section">` (line ~394), add:

```html
        <a href="/blog/" class="social-link blog-link">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            Read our blog
        </a>
```

**Step 2: Add blog-link CSS**

In the `<style>` block, after `.email-link:hover` rule (around line 196), add:

```css
.blog-link {
    background: var(--color-gaslight);
    color: var(--color-ink);
}

.blog-link:hover {
    background: #C49A4E;
    color: var(--color-ink);
}
```

**Step 3: Run build and verify**

Run: `npx @11ty/eleventy`
Expected: Build succeeds. `_site/index.html` contains the blog link.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add blog link to landing page"
```

---

### Task 6: Set up GitHub Actions deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create the workflow**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Verify YAML is valid**

Run: `node -e "const fs=require('fs'); const y=require('yaml'); y.parse(fs.readFileSync('.github/workflows/deploy.yml','utf8')); console.log('Valid YAML');"` (or just check syntax)

If `yaml` module not available, skip — the workflow syntax is straightforward.

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions deployment workflow"
```

---

### Task 7: Final verification

**Step 1: Full clean build**

Run: `rm -rf _site && npx @11ty/eleventy`

Verify all output exists:
- `_site/index.html` — landing page (unchanged content)
- `_site/blog/index.html` — blog list
- `_site/blog/hello-world/index.html` — sample post
- `_site/CNAME` — GitHub Pages domain
- `_site/favicon.svg` — favicon
- `_site/*.png`, `_site/*.webp` — images passed through

**Step 2: Verify landing page is untouched**

Run: `diff index.html _site/index.html`
Expected: No differences (or only whitespace from passthrough copy).

**Step 3: Verify OG tags on blog post**

Run: `grep "og:" _site/blog/hello-world/index.html`
Expected: og:title, og:description, og:image, og:type, og:url all present.

**Step 4: Run dev server for final visual check**

Run: `npx @11ty/eleventy --serve`

Check all pages look correct, then stop server.

**Step 5: Commit any remaining changes**

If any fixes were needed, commit them.

---

## Notes for deployment

After pushing to `main`, you'll need to go to the GitHub repo Settings > Pages and change the source from "Deploy from a branch" to "GitHub Actions". This is a one-time manual step.
