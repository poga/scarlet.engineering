# Linktree-style index + blog subscribe form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the index into a linktree-style layout and add a Buttondown subscribe form to the bottom of every devlog post, keeping the existing visual style.

**Architecture:** Pure HTML/CSS edits. `index.html` is a standalone passthrough-copied file. Blog posts share `_includes/blog/post.njk` -> `_includes/blog-base.njk`, so the subscribe form is added once in the shared layout. No JavaScript, no new dependencies — both reuse the existing Buttondown embed endpoint.

**Tech Stack:** Eleventy 3 (static site), Nunjucks layouts, plain CSS in inline `<style>` blocks.

## Global Constraints

- Keep the existing palette and fonts (Alfa Slab One / Lora on index; Roboto Slab / Lora on blog; ink / parchment / alizarin CSS variables). Do not introduce new colors outside the existing `:root` variables except the already-used `#4A4A4A` border.
- No JavaScript and no new npm dependencies.
- Buttondown endpoint (exact): `https://buttondown.com/api/emails/embed-subscribe/scarlet.engineering`.
- No automated test suite exists. Verification = `npm run build` succeeds and the built `_site` output contains the expected markup.
- Comments (if any) stay one line, focused on why.

---

### Task 1: Index page — tagline, trimmed newsletter, link-button stack

**Files:**
- Modify: `index.html` (CSS in the `<style>` block; markup in `<body>`)

**Interfaces:**
- Consumes: existing CSS variables and `.form-container`, `.embeddable-buttondown-form`, `.games-section` classes.
- Produces: new `.tagline`, `.link-stack`, `.link-button` CSS classes used only within `index.html`.

- [ ] **Step 1: Add the new CSS classes**

In `index.html`, inside the `<style>` block, replace the `.social-row`, `.social-link`, `.social-link:hover`, and `.embeddable-buttondown-form + .social-row` rules (the block currently at lines ~139-159) with these rules:

```css
        .tagline {
            font-family: var(--font-body);
            font-size: 1rem;
            font-style: italic;
            color: var(--color-fog);
            margin-bottom: 28px;
        }

        .link-stack {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 32px;
        }

        .link-button {
            display: block;
            width: 100%;
            padding: 14px 20px;
            font-family: var(--font-body);
            font-size: 1rem;
            font-weight: 600;
            color: var(--color-parchment);
            background: var(--color-soot);
            border: 1px solid #4A4A4A;
            border-radius: 2px;
            text-decoration: none;
            text-align: center;
            transition: all 0.2s ease;
        }

        .link-button:hover {
            background: #4A4A4A;
            border-color: var(--color-fog);
        }
```

- [ ] **Step 2: Add responsive rules for the new classes**

In the `@media (max-width: 480px)` block, add these rules (alongside the existing ones):

```css
            .tagline {
                font-size: 0.9375rem;
            }

            .link-button {
                padding: 12px 16px;
                font-size: 0.9375rem;
            }
```

In the `@media (max-width: 360px)` block, add:

```css
            .tagline {
                font-size: 0.875rem;
            }
```

- [ ] **Step 3: Restructure the body markup**

In `index.html`, replace the markup from `<h2 class="form-title">Join our newsletter</h2>` through the closing `</div>` of `.social-row` (the block currently at lines ~326-340) with:

```html
        <p class="tagline">we engineer emergence</p>
        <p class="form-description">New games and devlog updates, straight to your inbox.</p>
        <form
            action="https://buttondown.com/api/emails/embed-subscribe/scarlet.engineering"
            method="post"
            class="embeddable-buttondown-form"
        >
            <input type="email" name="email" id="bd-email" placeholder="you@example.com" />
            <input type="submit" value="Subscribe" />
        </form>
        <nav class="link-stack">
            <a href="/blog/" class="link-button" title="Devlog">Devlog</a>
            <a href="https://discord.gg/FFymAKhRzD" target="_blank" class="link-button" title="Join our Discord">Discord</a>
            <a href="mailto:hi@scarlet.engineering" class="link-button" title="Email us">Email</a>
        </nav>
```

Leave the `<picture>` logo block above and the `<section class="games-section">` block below unchanged.

- [ ] **Step 4: Build and verify the output**

Run: `npm run build`
Expected: build completes with no errors, writes `_site/index.html`.

Run: `grep -c 'class="link-button"' _site/index.html`
Expected: `3`

Run: `grep -o 'we engineer emergence' _site/index.html`
Expected: `we engineer emergence`

Run: `grep -c 'class="form-title"' _site/index.html`
Expected: `0` (old heading removed)

Run: `grep -c 'games-section' _site/index.html`
Expected: `1` (game cards still present)

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: linktree-style index with tagline and link buttons"
```

---

### Task 2: Blog post subscribe form

**Files:**
- Modify: `_includes/blog/post.njk` (append the subscribe block)
- Modify: `_includes/blog-base.njk` (add `.post-subscribe` styles)

**Interfaces:**
- Consumes: existing blog CSS variables and the existing `hr` style in `blog-base.njk`.
- Produces: `.post-subscribe`, `.post-subscribe-title`, `.post-subscribe-form` CSS classes used by the shared post layout.

- [ ] **Step 1: Add the subscribe styles to blog-base.njk**

In `_includes/blog-base.njk`, inside the `<style>` block, immediately before the closing `</style>` (after the existing `@media (max-width: 480px)` block), add:

```css
        .post-subscribe { margin-top: 24px; }

        .post-subscribe hr { margin: 0 0 32px; }

        .post-subscribe-title {
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 1.25rem;
        }

        .post-subscribe-form input[type="email"] {
            width: 100%;
            padding: 14px 16px;
            font-family: var(--font-body);
            font-size: 1rem;
            color: var(--color-parchment);
            background: var(--color-soot);
            border: 1px solid var(--color-fog);
            border-radius: 2px;
            outline: none;
            transition: border-color 0.2s;
        }

        .post-subscribe-form input[type="email"]:focus {
            border-color: var(--color-alizarin);
        }

        .post-subscribe-form input[type="submit"] {
            width: 100%;
            padding: 14px 24px;
            margin-top: 12px;
            font-family: var(--font-body);
            font-size: 1rem;
            font-weight: 600;
            color: var(--color-parchment);
            background: var(--color-alizarin);
            border: none;
            border-radius: 2px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .post-subscribe-form input[type="submit"]:hover {
            background: var(--color-madder);
        }

        @supports (-webkit-touch-callout: none) {
            .post-subscribe-form input[type="email"] { font-size: 16px; }
        }
```

- [ ] **Step 2: Append the subscribe markup to post.njk**

In `_includes/blog/post.njk`, after the closing `</article>` tag, add:

```html
<aside class="post-subscribe">
    <hr>
    <h3 class="post-subscribe-title">Enjoyed this? Get the next devlog in your inbox.</h3>
    <form
        action="https://buttondown.com/api/emails/embed-subscribe/scarlet.engineering"
        method="post"
        class="post-subscribe-form"
    >
        <input type="email" name="email" placeholder="you@example.com" />
        <input type="submit" value="Subscribe" />
    </form>
</aside>
```

- [ ] **Step 3: Build and verify the output**

Run: `npm run build`
Expected: build completes with no errors.

Run: `grep -c 'post-subscribe-form' _site/blog/2026-04-10-ground-shader/index.html`
Expected: `1`

Run: `grep -o 'Enjoyed this? Get the next devlog in your inbox.' _site/blog/2026-04-10-ground-shader/index.html`
Expected: `Enjoyed this? Get the next devlog in your inbox.`

Run: `grep -c 'embed-subscribe/scarlet.engineering' _site/blog/2026-02-14-curves-of-fun/index.html`
Expected: `1` (confirms the form reaches every post via the shared layout)

- [ ] **Step 4: Commit**

```bash
git add _includes/blog/post.njk _includes/blog-base.njk
git commit -m "feat: add subscribe form to bottom of devlog posts"
```

---

## Self-Review

**Spec coverage:**
- Index: tagline -> Task 1 Step 3. Trimmed newsletter (drop `.form-title`) -> Task 1 Step 3. Link-button stack (Devlog/Discord/Email) -> Task 1 Steps 1+3. Muted button style, red reserved for actions -> Task 1 Step 1. Games unchanged -> Task 1 Step 3 (explicitly left alone). Responsive -> Task 1 Step 2.
- Blog: subscribe form in shared `post.njk` -> Task 2 Step 2. `.post-subscribe` styles in `blog-base.njk` -> Task 2 Step 1. Applies to all posts -> Task 2 Step 3 verifies two different posts.
- No JS / no deps -> honored; only HTML/CSS edits.

**Placeholder scan:** No TBD/TODO; every code step shows full code; every verify step shows exact command and expected output.

**Type/name consistency:** `.link-button` / `.link-stack` / `.tagline` used consistently in Task 1. `.post-subscribe` / `.post-subscribe-title` / `.post-subscribe-form` used consistently across Task 2 Steps 1-2. Built post paths match the `permalink: /blog/{{ page.fileSlug }}/` rule from `blog/posts/posts.json`.
