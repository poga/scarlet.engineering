# Social Media Buttons Design

## Overview

Add Instagram and Bluesky buttons to the landing page alongside the existing Discord button.

## Design Decisions

**Button Colors (each platform gets its brand color):**
- Instagram: Gradient `linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)`
- Bluesky: Solid `#0085FF` (hover: `#0073E6`)
- Discord: Keep existing verdigris `#4A766E`

**Layout:**
- All three buttons stacked vertically, full-width
- Order: Instagram → Bluesky → Discord (largest platform first)
- 12px vertical spacing between buttons

**Button Labels (action-focused):**
1. "Follow on Instagram"
2. "Follow on Bluesky"
3. "Join our Discord"

**Links:**
- Instagram: https://www.instagram.com/scarlet.engineering/
- Bluesky: https://bsky.app/profile/scarletengineering.bsky.social
- Discord: (existing link unchanged)

## Implementation

**HTML Structure:**
- Three `<a>` tags in the form container after newsletter signup
- Each with inline SVG icon + text

**CSS Approach:**
- Shared `.social-link` base class (padding, font, flexbox, transition)
- Modifier classes: `.instagram-link`, `.bluesky-link`, `.discord-link`
- Match existing button pattern: 14px 24px padding, font-weight 600, 2px border-radius

**Icons:**
- Instagram: Camera/viewfinder outline (inline SVG, 20x20px)
- Bluesky: Butterfly logo (inline SVG, 20x20px)
- Discord: Keep existing SVG

**Accessibility:**
- `target="_blank"` on all links
- `aria-hidden="true"` on icons
- White text on colored backgrounds for contrast
