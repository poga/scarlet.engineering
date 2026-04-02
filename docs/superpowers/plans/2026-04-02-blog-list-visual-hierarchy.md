# Blog List Visual Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De-emphasize the blog list page title into an eyebrow label and make post titles the primary visual focus.

**Architecture:** Pure CSS + template change. Add a `.blog-eyebrow` class to the page title h1 in the blog list template, add corresponding CSS in the shared layout, and clean up inline style overrides on post title h2 elements.

**Tech Stack:** Eleventy (Nunjucks templates), custom CSS

---

### Task 1: Add eyebrow CSS and blog-list post title styles

**Files:**
- Modify: `_includes/blog-base.njk:84-86` (after existing h1/h2 rules)

- [ ] **Step 1: Add `.blog-eyebrow` class and `.blog-list` scoped h2 styles**

In `_includes/blog-base.njk`, add the following CSS rules after line 86 (`h3 { font-size: 1.25rem; ... }`), before the `a {` rule on line 88:

```css
        .blog-eyebrow {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--color-fog);
            margin-bottom: 32px;
        }

        .blog-list h2 {
            font-size: 1.5rem;
            font-weight: 500;
            margin-top: 0;
            margin-bottom: 8px;
        }
```

- [ ] **Step 2: Update mobile breakpoint**

In the same file, inside the `@media (max-width: 480px)` block (line 188-193), the existing `h1 { font-size: 1.5rem; }` rule will still apply to post page h1s. Add a mobile override for the eyebrow so it doesn't get the post-page h1 mobile size:

```css
            .blog-eyebrow { font-size: 0.7rem; }
            .blog-list h2 { font-size: 1.25rem; }
```

- [ ] **Step 3: Commit**

```bash
git add _includes/blog-base.njk
git commit -m "style: add eyebrow and blog-list h2 CSS for visual hierarchy"
```

---

### Task 2: Update blog list template to use new classes

**Files:**
- Modify: `blog/blog.njk:9-14`

- [ ] **Step 1: Add eyebrow class to h1 and blog-list class to container div**

Replace lines 9-14 of `blog/blog.njk`:

```html
<h1>Scarlet Engineering - Devlog</h1>
<div style="margin-top: 32px;">
    {%- for post in collections.posts %}
    <article style="margin-bottom: 32px;">
        <a href="{{ post.url }}" style="text-decoration: none;">
            <h2 style="margin-top: 0; font-size: 1.25rem;">{{ post.data.title }}</h2>
```

With:

```html
<h1 class="blog-eyebrow">Scarlet Engineering - Devlog</h1>
<div class="blog-list" style="margin-top: 32px;">
    {%- for post in collections.posts %}
    <article style="margin-bottom: 32px;">
        <a href="{{ post.url }}" style="text-decoration: none;">
            <h2>{{ post.data.title }}</h2>
```

Changes:
- `<h1>` gets `class="blog-eyebrow"`
- `<div>` gets `class="blog-list"` to scope the h2 styles
- `<h2>` inline `style="margin-top: 0; font-size: 1.25rem;"` removed (now handled by `.blog-list h2` CSS)

- [ ] **Step 2: Commit**

```bash
git add blog/blog.njk
git commit -m "style: apply eyebrow class to page title, remove inline h2 overrides"
```

---

### Task 3: Visual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify blog list page at http://localhost:8080/blog/**

Check:
- Page title "SCARLET ENGINEERING - DEVLOG" is small, uppercase, gray, letter-spaced
- Post titles are larger (1.5rem), slightly bolder (weight 500), parchment color
- Clear visual hierarchy — post titles dominate, page title is a quiet label
- Date styling unchanged
- Article spacing unchanged

- [ ] **Step 3: Verify individual post page (e.g. http://localhost:8080/blog/ground-shader/)**

Check:
- Post page h1 is unchanged (still 2rem, normal weight, parchment)
- No eyebrow styling leaking into post pages

- [ ] **Step 4: Verify mobile responsive (resize to <480px)**

Check:
- Eyebrow scales down to 0.7rem
- Post titles scale to 1.25rem
- Everything still readable

- [ ] **Step 5: Commit (if any fixes needed)**

Only if adjustments were required during verification.
