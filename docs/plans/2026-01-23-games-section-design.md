# Games Section Design

## Overview

Add a games section to the landing page to showcase 2-3 published games on itch.io. The section appears below the social links with clear visual separation, maintaining the social links as the primary focus.

## Requirements

- Display 2-3 games with thumbnail, title, description, and itch.io link
- Position below social links with generous spacing (48px+)
- Match existing design system (colors, typography, button styles)
- Responsive on mobile

## Visual Design

### Layout
- Section header: "Our Games" in Playfair Display, alizarin color
- Cards stack vertically
- 48-60px margin-top to separate from social links

### Game Cards
- Thumbnail: 16:9 aspect ratio, max-width 280px on desktop, full-width on mobile
- Title: Playfair Display font
- Description: Source Serif 4, 1-2 lines
- Button: "Play on itch.io" with itch.io brand color (#FA5C5C)

### Card Styling
- Background: `var(--color-cream)`
- Border: `1px solid var(--color-ornament)`
- Border-radius: 2px (matching existing buttons)
- Padding: 16px

## HTML Structure

```html
<section class="games-section">
  <h3 class="games-title">Our Games</h3>
  <div class="game-card">
    <img src="game-thumb.webp" alt="Game Name" class="game-thumbnail">
    <h4 class="game-name">Game Title</h4>
    <p class="game-description">Short description of the game.</p>
    <a href="https://itch.io/game-url" target="_blank" class="game-link">Play on itch.io</a>
  </div>
</section>
```

## New CSS Variables

```css
--color-itch: #FA5C5C;
--color-itch-hover: #E54545;
```

## Implementation Notes

- Add webp thumbnails for each game (optimize for web)
- Keep descriptions concise (under 100 characters)
- Cards should have consistent height or allow natural flow
