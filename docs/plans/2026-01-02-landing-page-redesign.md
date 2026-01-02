# Landing Page Redesign

Redesign the landing page to follow the Scarlet Engineering Design System.

## Overview

Minimal landing page with newsletter signup and Discord link, styled to match the Victorian-era inspired design system ("A Study in Scarlet" 1887 aesthetic).

## Design Decisions

| Decision | Choice |
|----------|--------|
| Page purpose | Newsletter signup + Discord link only |
| Background | Ink Black with subtle CSS diagonal line pattern |
| Form container | Soot card with subtle border |
| Discord button | Verdigris accent color |
| Implementation | CSS pattern (no additional image assets) |

## Specification

### Background

- Base color: Ink Black (#1A1A1A)
- Pattern: Subtle diagonal lines using CSS `repeating-linear-gradient`
- Lines: Soot (#3D3D3D) at 45° angle, spaced 8-10px apart
- Creates vintage engraved/etched paper feel

### Card Container

- Background: Soot (#3D3D3D)
- Border: 1px solid #4A4A4A
- Border-radius: 4px
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.3)`
- Padding: 40px
- Max-width: 420px
- Centered vertically and horizontally

### Typography

**Logo:**
- Existing logo.png
- Max-width: 280px
- Margin-bottom: 24px

**Title:**
- Font: Playfair Display, 600 weight
- Size: 1.5rem
- Color: Parchment (#E8E0D0)
- Margin-bottom: 12px

**Description:**
- Font: Source Serif 4, 400 weight
- Size: 0.875rem
- Color: Fog (#9A9A8E)
- Line-height: 1.6
- Margin-bottom: 24px

### Form Elements

**Email Input:**
- Background: Ink Black (#1A1A1A)
- Border: 2px solid Fog (#9A9A8E)
- Border-radius: 2px
- Padding: 14px 16px
- Font: Source Serif 4, 1rem
- Text color: Parchment (#E8E0D0)
- Placeholder: Fog (#9A9A8E)
- Focus state: border-color Alizarin (#7B1818)

**Subscribe Button (Primary):**
- Background: Alizarin Crimson (#7B1818)
- Hover: Madder Red (#A04040)
- Text: Parchment (#E8E0D0)
- Border-radius: 2px
- Padding: 14px 24px
- Font: Source Serif 4, 1rem, 600 weight
- Full width, margin-top: 12px

**Discord Button:**
- Background: Verdigris (#4A766E)
- Hover: #5A867E
- Text: Parchment (#E8E0D0)
- Same sizing/radius as Subscribe
- Discord icon inline
- Full width, margin-top: 12px

### Responsive Breakpoints

**480px:**
- Card padding: 28px 24px
- Logo max-width: 220px
- Body padding: 16px sides

**360px:**
- Card padding: 24px 20px
- Logo max-width: 180px
- Body padding: 12px sides

### Transitions

- Buttons: `transition: all 0.2s ease`
- Input focus: `transition: border-color 0.2s`
- No translateY hover effects (flat, sophisticated)

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Source+Serif+4:wght@400;600&display=swap" rel="stylesheet">
```

## CSS Variables

```css
:root {
  --color-alizarin: #7B1818;
  --color-madder: #A04040;
  --color-ink: #1A1A1A;
  --color-soot: #3D3D3D;
  --color-fog: #9A9A8E;
  --color-parchment: #E8E0D0;
  --color-verdigris: #4A766E;
  --font-heading: 'Playfair Display', 'Baskerville', serif;
  --font-body: 'Source Serif 4', 'Georgia', serif;
}
```
