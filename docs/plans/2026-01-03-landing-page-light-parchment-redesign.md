# Landing Page Light Parchment Redesign

Redesign the landing page from dark theme to light parchment aesthetic, moving away from the "e-sport hardware" feel toward Victorian literary elegance inspired by "A Study in Scarlet" (1887).

## Design Decisions

| Decision | Choice |
|----------|--------|
| Background | Light parchment with paper texture |
| Container | None - content floats on parchment |
| Decorations | Geometric/architectural corner ornaments |
| Typography | Scarlet headlines, dark body text |
| Buttons | Keep Alizarin (primary) and Verdigris (Discord) |

## Specification

### Background

- Base color: Parchment (#E8E0D0)
- Texture: Subtle CSS noise/paper grain overlay for aged paper feel
- Implementation: Semi-transparent noise pattern or CSS filter

### Corner Ornaments

- Style: Victorian engineering blueprint aesthetic
- Elements: Circles, arcs, measurement lines, crosshairs
- Color: Muted warm gray (#C5B8A5)
- Line weight: Thin (1-2px)
- Position: Absolute, partially extending off-screen at edges
- Implementation: SVG elements in each corner

### Typography

**Logo:**
- Existing logo.png
- Max-width: 280px
- Centered
- Margin-bottom: 24px

**Headline:**
- Text: "Join our newsletter"
- Font: Playfair Display, 600 weight
- Size: 1.5rem
- Color: Alizarin Crimson (#7B1818)
- Margin-bottom: 12px

**Description:**
- Font: Source Serif 4, 400 weight
- Size: 0.875rem
- Color: Ink Black (#1A1A1A)
- Line-height: 1.6
- Margin-bottom: 24px

### Form Elements

**Email Input:**
- Background: #F5F0E6 (light cream)
- Border: 2px solid Fog (#9A9A8E)
- Border-radius: 2px
- Padding: 14px 16px
- Font: Source Serif 4, 1rem
- Text color: Ink Black (#1A1A1A)
- Placeholder: Fog (#9A9A8E)
- Focus state: border-color Alizarin (#7B1818)
- Transition: border-color 0.2s

**Subscribe Button:**
- Background: Alizarin Crimson (#7B1818)
- Hover: Madder Red (#A04040)
- Text: Parchment (#E8E0D0)
- Border-radius: 2px
- Padding: 14px 24px
- Font: Source Serif 4, 1rem, 600 weight
- Full width
- Margin-top: 12px
- Transition: all 0.2s ease

**Discord Button:**
- Background: Verdigris (#4A766E)
- Hover: #5A867E
- Text: Parchment (#E8E0D0)
- Same sizing/radius as Subscribe
- Discord icon inline
- Full width
- Margin-top: 12px
- Transition: all 0.2s ease

### Layout

- Content max-width: 420px
- Centered vertically and horizontally
- No container/card - content floats directly on background
- Generous vertical spacing between elements

### Responsive Breakpoints

**Default (Desktop):**
- Corner ornaments visible in all four corners
- Content centered both ways
- Max-width: 420px

**480px:**
- Corner ornaments scale down or show only inner portions
- Content shifts toward top (padding-top: 10vh)
- Body padding: 16px sides
- Logo max-width: 220px
- Smaller typography

**360px:**
- Corner ornaments very subtle or hidden
- Body padding: 12px sides
- Logo max-width: 180px
- Tighter spacing

### CSS Variables

```css
:root {
  --color-alizarin: #7B1818;
  --color-madder: #A04040;
  --color-ink: #1A1A1A;
  --color-soot: #3D3D3D;
  --color-fog: #9A9A8E;
  --color-parchment: #E8E0D0;
  --color-cream: #F5F0E6;
  --color-ornament: #C5B8A5;
  --color-verdigris: #4A766E;
  --color-verdigris-hover: #5A867E;
  --font-heading: 'Playfair Display', 'Baskerville', serif;
  --font-body: 'Source Serif 4', 'Georgia', serif;
}
```

## Reference Images

1. Vintage parchment with architectural/geometric line drawings in corners
2. "A Study in Scarlet" book cover - aged cream paper with scarlet typography
