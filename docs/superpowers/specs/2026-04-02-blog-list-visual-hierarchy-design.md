# Blog List Page Visual Hierarchy Improvement

## Problem

The blog list page (`/blog/`) has poor visual hierarchy. The page title (`h1`, 2rem) and post titles (`h2`, 1.25rem inline override) use the same font family (Roboto Slab), weight (400), and color (parchment). The only differentiator is a modest size gap, making them feel too similar.

## Goal

De-emphasize the page title and make post titles the primary visual focus of the page.

## Approach

Eyebrow label for page title + enlarged post titles. Pure typographic solution — no new colors, borders, or structural changes.

## Design

### Page title (h1) becomes an eyebrow label

- Font-size: `0.75rem` (~13.5px)
- Text-transform: `uppercase`
- Letter-spacing: `0.1em`
- Color: `var(--color-fog)` (#9A9A8E, muted gray)
- Font-weight: 400 (unchanged)
- Font-family: Roboto Slab (unchanged)
- Margin-bottom: 32px

### Post titles (h2) become the primary focus

- Font-size: `1.5rem` (~27px), up from 1.25rem
- Font-weight: `500`, up from 400
- Color: `var(--color-parchment)` (unchanged)
- Remove inline `font-size` and `margin-top` overrides from template; move to CSS

### Unchanged

- Date styling
- Article spacing (32px margin-bottom)
- Mobile responsive breakpoint at 480px (scales proportionally)
- Overall page structure and layout

## Scoping note

The eyebrow styling applies only to the blog list page h1, not to individual post pages (which also use h1 for the post title via `blog/post.njk`). This can be achieved by adding a CSS class to the h1 in `blog/blog.njk` rather than changing the global h1 rule.

## Files to modify

1. `blog/blog.njk` — add class to h1, remove inline styles from h2
2. `_includes/blog-base.njk` — add CSS for the eyebrow class and blog-list h2 styling
