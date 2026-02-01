# Typography Update: Alfa Slab One

Update the design system and landing page to use Alfa Slab One for headings.

## Design Decisions

| Decision | Choice |
|----------|--------|
| Heading font | Alfa Slab One |
| Body font | Cormorant Garamond (keep existing) |
| Heading hierarchy | Size-based only (no weight variation) |
| Fallback stack | Rockwell, serif |

## Specification

### CSS Variable

```css
--font-heading: 'Alfa Slab One', 'Rockwell', serif;
```

### Google Fonts Import

```
https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Cormorant+Garamond:wght@300;400;600&display=swap
```

### Heading Styles

Remove all `font-weight` declarations from heading elements since Alfa Slab One only has one weight.

| Element | Size (Design System) | Size (Landing) |
|---------|---------------------|----------------|
| h1 | 2.5rem | - |
| h2 | 1.75rem | 1.5rem |
| h3 | 1.25rem | 1.5rem |

### Files to Update

1. **index.html**
   - Update Google Fonts import (replace Playfair Display with Alfa Slab One)
   - Update `--font-heading` CSS variable
   - Remove `font-weight` from `.form-title`, `.games-title`, `.game-name`

2. **scarlet-engineering-design-system.html**
   - Update Google Fonts import
   - Update `--font-heading` CSS variable
   - Remove `font-weight` from all heading styles
   - Update typography sample labels to reflect Alfa Slab One
