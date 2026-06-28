# Linktree-style index + blog subscribe form

Date: 2026-06-28

## Goal

Two changes, keeping the existing visual style (Alfa Slab One / Lora, ink /
parchment / alizarin palette):

1. Restructure the index page into a linktree-style layout.
2. Add an email subscription form to the bottom of every devlog post.

## Context

- `index.html` is a standalone, passthrough-copied file (not Eleventy-templated).
  Today it is already a centered single column: logo, "Join our newsletter"
  Buttondown form, a tiny text social row (discord / email / blog), then an
  "Our Games" section with two rich thumbnail cards.
- Blog posts render through `_includes/blog/post.njk` -> `_includes/blog-base.njk`.
  Editing `post.njk` reaches all current and future posts.
- The Buttondown embed endpoint is already in use on the index:
  `https://buttondown.com/api/emails/embed-subscribe/scarlet.engineering`.
- No test suite exists; the only build/verification is `npm run build` (Eleventy).

## Design

### 1. Index page — Hybrid linktree

Single centered column (existing `.form-container`), new top-to-bottom order:

1. **Logo** — existing `<picture>`, unchanged.
2. **Tagline** — new `<p class="tagline">we engineer emergence</p>` (reuses the
   existing brand line from the page's OG title), styled in fog. Replaces the
   large "Join our newsletter" heading as the bio line.
3. **Newsletter block** — the existing Buttondown form, kept near the top but
   trimmed: drop the big `.form-title` heading; keep one short supporting line
   above the field ("New games and devlog updates, straight to your inbox.").
   Reads as a compact bio-form, not a hero.
4. **Link buttons** — the tiny `.social-row` text links become a vertical stack
   of full-width buttons (new `.link-button` class): Devlog (`/blog/`), Discord
   (`https://discord.gg/FFymAKhRzD`), Email (`mailto:hi@scarlet.engineering`).
5. **Our Games** — the two existing `.game-card`s (Murderhorn, BLOCKS 10) kept
   exactly as-is.

**Button styling / hierarchy:** `.link-button` uses the muted card look — soot
background, 1px `#4A4A4A` border, parchment text, radius 2px, full width, hover
lightens the background. The red fill (alizarin / itch) stays reserved for the
action buttons (Subscribe, Play on itch.io) so they remain the visual emphasis.

Existing responsive breakpoints (480px / 360px) get matching rules for the new
tagline and link buttons so the page stays consistent on mobile.

### 2. Blog post subscribe form

- In `_includes/blog/post.njk`, after the article content: a styled `<hr>`, a
  one-line CTA heading ("Enjoyed this? Get the next devlog in your inbox."), and
  the same Buttondown email field + Subscribe button.
- In `_includes/blog-base.njk` (which currently has no form styles), add a small
  `.post-subscribe` style block matching the blog palette: soot input with fog
  border, alizarin Subscribe button (madder on hover), parchment text, full
  width, radius 2px. Include the iOS 16px font-size guard used on the index.
- Living in the shared `post.njk` layout, it applies to all posts automatically.

## Non-goals / YAGNI

- No JavaScript, no new dependencies — both reuse the Buttondown embed endpoint.
- No change to game card content, copy, or images.
- No new build tooling; `npm run build` remains the only verification.

## Verification

- `npm run build` succeeds and emits `_site/index.html` plus the post pages.
- Built index shows: logo, tagline, newsletter form, three link buttons, two
  game cards.
- Each built post page ends with the divider, CTA heading, and Buttondown form.
