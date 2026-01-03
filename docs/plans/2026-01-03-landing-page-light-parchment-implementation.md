# Light Parchment Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the dark landing page into a light parchment aesthetic with Victorian engineering corner ornaments.

**Architecture:** Single HTML file with inline CSS. Replace dark background with parchment, remove card container, add SVG corner ornaments, update form styling for light theme.

**Tech Stack:** HTML, CSS, inline SVG

---

### Task 1: Update CSS Variables and Background

**Files:**
- Modify: `index.html:24-35` (CSS variables)
- Modify: `index.html:47-63` (body styles)

**Step 1: Add new CSS variables**

Update the `:root` block to add new color variables:

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

**Step 2: Update body styles**

Replace the dark background with light parchment:

```css
body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--color-parchment);
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.6;
}
```

**Step 3: Verify in browser**

Open `index.html` in browser. Background should be cream/parchment colored.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: change background from dark to light parchment"
```

---

### Task 2: Remove Card Container Styling

**Files:**
- Modify: `index.html:65-74` (form-container styles)

**Step 1: Update form-container to remove card appearance**

Replace the card styling with simple centered content:

```css
.form-container {
    width: 100%;
    max-width: 420px;
    padding: 40px;
    text-align: center;
    position: relative;
    z-index: 1;
}
```

**Step 2: Verify in browser**

Content should now float on parchment without visible card background or border.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: remove card container, float content on parchment"
```

---

### Task 3: Update Typography Colors

**Files:**
- Modify: `index.html:81-95` (title and description styles)

**Step 1: Update headline to scarlet**

```css
.form-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-alizarin);
    margin-bottom: 12px;
}
```

**Step 2: Update description to dark ink**

```css
.form-description {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-ink);
    line-height: 1.6;
    margin-bottom: 24px;
}
```

**Step 3: Verify in browser**

Headline should be scarlet red, description should be dark but readable on parchment.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: update typography colors for light background"
```

---

### Task 4: Update Form Input Styling

**Files:**
- Modify: `index.html:97-116` (email input styles)

**Step 1: Update input styles for light theme**

```css
.embeddable-buttondown-form input[type="email"] {
    width: 100%;
    padding: 14px 16px;
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--color-ink);
    background: var(--color-cream);
    border: 2px solid var(--color-fog);
    border-radius: 2px;
    outline: none;
    transition: border-color 0.2s;
}

.embeddable-buttondown-form input[type="email"]::placeholder {
    color: var(--color-fog);
}

.embeddable-buttondown-form input[type="email"]:focus {
    border-color: var(--color-alizarin);
}
```

**Step 2: Verify in browser**

Input should have light cream background with visible border, dark text.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: update form input styling for light theme"
```

---

### Task 5: Add Corner Ornaments Structure

**Files:**
- Modify: `index.html` (add styles after form-container, before responsive)
- Modify: `index.html` (add SVG elements in body)

**Step 1: Add corner ornament CSS**

Add after the `.discord-link:hover` styles, before the responsive media queries:

```css
.corner-ornament {
    position: fixed;
    width: 200px;
    height: 200px;
    pointer-events: none;
    z-index: 0;
}

.corner-ornament svg {
    width: 100%;
    height: 100%;
    stroke: var(--color-ornament);
    stroke-width: 1;
    fill: none;
}

.corner-top-left {
    top: -20px;
    left: -20px;
}

.corner-top-right {
    top: -20px;
    right: -20px;
    transform: scaleX(-1);
}

.corner-bottom-left {
    bottom: -20px;
    left: -20px;
    transform: scaleY(-1);
}

.corner-bottom-right {
    bottom: -20px;
    right: -20px;
    transform: scale(-1, -1);
}
```

**Step 2: Add SVG ornaments to HTML**

Add immediately after `<body>` opening tag, before the form-container div:

```html
<!-- Corner Ornaments -->
<div class="corner-ornament corner-top-left">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Concentric arcs -->
        <path d="M 20 180 A 160 160 0 0 1 180 20" />
        <path d="M 20 140 A 120 120 0 0 1 140 20" />
        <path d="M 20 100 A 80 80 0 0 1 100 20" />
        <!-- Radial lines -->
        <line x1="20" y1="20" x2="20" y2="60" />
        <line x1="20" y1="20" x2="60" y2="20" />
        <line x1="20" y1="80" x2="50" y2="80" />
        <line x1="80" y1="20" x2="80" y2="50" />
        <!-- Measurement marks -->
        <line x1="35" y1="20" x2="35" y2="30" />
        <line x1="50" y1="20" x2="50" y2="25" />
        <line x1="20" y1="35" x2="30" y2="35" />
        <line x1="20" y1="50" x2="25" y2="50" />
        <!-- Circle detail -->
        <circle cx="60" cy="60" r="8" />
        <circle cx="60" cy="60" r="3" />
        <!-- Cross marks -->
        <line x1="100" y1="95" x2="100" y2="105" />
        <line x1="95" y1="100" x2="105" y2="100" />
        <line x1="140" y1="55" x2="140" y2="65" />
        <line x1="135" y1="60" x2="145" y2="60" />
        <!-- Diagonal -->
        <line x1="120" y1="20" x2="180" y2="80" />
        <line x1="20" y1="120" x2="80" y2="180" />
    </svg>
</div>
<div class="corner-ornament corner-top-right">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 180 A 160 160 0 0 1 180 20" />
        <path d="M 20 140 A 120 120 0 0 1 140 20" />
        <path d="M 20 100 A 80 80 0 0 1 100 20" />
        <line x1="20" y1="20" x2="20" y2="60" />
        <line x1="20" y1="20" x2="60" y2="20" />
        <line x1="20" y1="80" x2="50" y2="80" />
        <line x1="80" y1="20" x2="80" y2="50" />
        <line x1="35" y1="20" x2="35" y2="30" />
        <line x1="50" y1="20" x2="50" y2="25" />
        <line x1="20" y1="35" x2="30" y2="35" />
        <line x1="20" y1="50" x2="25" y2="50" />
        <circle cx="60" cy="60" r="8" />
        <circle cx="60" cy="60" r="3" />
        <line x1="100" y1="95" x2="100" y2="105" />
        <line x1="95" y1="100" x2="105" y2="100" />
        <line x1="140" y1="55" x2="140" y2="65" />
        <line x1="135" y1="60" x2="145" y2="60" />
        <line x1="120" y1="20" x2="180" y2="80" />
        <line x1="20" y1="120" x2="80" y2="180" />
    </svg>
</div>
<div class="corner-ornament corner-bottom-left">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 180 A 160 160 0 0 1 180 20" />
        <path d="M 20 140 A 120 120 0 0 1 140 20" />
        <path d="M 20 100 A 80 80 0 0 1 100 20" />
        <line x1="20" y1="20" x2="20" y2="60" />
        <line x1="20" y1="20" x2="60" y2="20" />
        <line x1="20" y1="80" x2="50" y2="80" />
        <line x1="80" y1="20" x2="80" y2="50" />
        <line x1="35" y1="20" x2="35" y2="30" />
        <line x1="50" y1="20" x2="50" y2="25" />
        <line x1="20" y1="35" x2="30" y2="35" />
        <line x1="20" y1="50" x2="25" y2="50" />
        <circle cx="60" cy="60" r="8" />
        <circle cx="60" cy="60" r="3" />
        <line x1="100" y1="95" x2="100" y2="105" />
        <line x1="95" y1="100" x2="105" y2="100" />
        <line x1="140" y1="55" x2="140" y2="65" />
        <line x1="135" y1="60" x2="145" y2="60" />
        <line x1="120" y1="20" x2="180" y2="80" />
        <line x1="20" y1="120" x2="80" y2="180" />
    </svg>
</div>
<div class="corner-ornament corner-bottom-right">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 180 A 160 160 0 0 1 180 20" />
        <path d="M 20 140 A 120 120 0 0 1 140 20" />
        <path d="M 20 100 A 80 80 0 0 1 100 20" />
        <line x1="20" y1="20" x2="20" y2="60" />
        <line x1="20" y1="20" x2="60" y2="20" />
        <line x1="20" y1="80" x2="50" y2="80" />
        <line x1="80" y1="20" x2="80" y2="50" />
        <line x1="35" y1="20" x2="35" y2="30" />
        <line x1="50" y1="20" x2="50" y2="25" />
        <line x1="20" y1="35" x2="30" y2="35" />
        <line x1="20" y1="50" x2="25" y2="50" />
        <circle cx="60" cy="60" r="8" />
        <circle cx="60" cy="60" r="3" />
        <line x1="100" y1="95" x2="100" y2="105" />
        <line x1="95" y1="100" x2="105" y2="100" />
        <line x1="140" y1="55" x2="140" y2="65" />
        <line x1="135" y1="60" x2="145" y2="60" />
        <line x1="120" y1="20" x2="180" y2="80" />
        <line x1="20" y1="120" x2="80" y2="180" />
    </svg>
</div>
```

**Step 3: Verify in browser**

Four corner ornaments should appear, each mirrored appropriately. Should look like Victorian engineering blueprints.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add SVG corner ornaments with blueprint aesthetic"
```

---

### Task 6: Update Responsive Styles for Ornaments

**Files:**
- Modify: `index.html` (responsive media queries section)

**Step 1: Update 480px breakpoint**

Replace the existing `@media (max-width: 480px)` block:

```css
@media (max-width: 480px) {
    body {
        padding: 16px;
        align-items: flex-start;
        padding-top: 10vh;
    }

    .form-container {
        padding: 28px 24px;
    }

    .logo {
        max-width: 220px;
        margin-bottom: 16px;
    }

    .form-title {
        font-size: 1.25rem;
    }

    .form-description {
        font-size: 0.8125rem;
        margin-bottom: 16px;
    }

    .embeddable-buttondown-form input[type="email"],
    .embeddable-buttondown-form input[type="submit"],
    .discord-link {
        padding: 12px 14px;
        font-size: 0.9375rem;
    }

    .corner-ornament {
        width: 120px;
        height: 120px;
        opacity: 0.6;
    }
}
```

**Step 2: Update 360px breakpoint**

Replace the existing `@media (max-width: 360px)` block:

```css
@media (max-width: 360px) {
    body {
        padding: 12px;
    }

    .form-container {
        padding: 24px 20px;
    }

    .logo {
        max-width: 180px;
    }

    .form-title {
        font-size: 1.125rem;
    }

    .form-description {
        font-size: 0.75rem;
    }

    .corner-ornament {
        width: 80px;
        height: 80px;
        opacity: 0.4;
    }
}
```

**Step 3: Verify in browser**

Test at various widths. Ornaments should shrink and fade on smaller screens.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add responsive scaling for corner ornaments"
```

---

### Task 7: Final Polish and Verification

**Files:**
- Modify: `index.html` (if needed)

**Step 1: Visual review checklist**

Open in browser and verify:
- [ ] Parchment background visible
- [ ] No card container visible
- [ ] Scarlet headline color
- [ ] Dark body text readable
- [ ] Input has light cream background
- [ ] Input focus shows scarlet border
- [ ] Buttons retain correct colors (Alizarin, Verdigris)
- [ ] Four corner ornaments visible
- [ ] Ornaments don't interfere with content
- [ ] Responsive: ornaments scale at 480px
- [ ] Responsive: ornaments fade at 360px
- [ ] Logo displays correctly on light background

**Step 2: Fix any issues found**

Address any visual issues discovered during review.

**Step 3: Final commit**

```bash
git add index.html
git commit -m "feat: complete light parchment landing page redesign"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Update CSS variables and background to parchment |
| 2 | Remove card container styling |
| 3 | Update typography colors for light theme |
| 4 | Update form input styling |
| 5 | Add SVG corner ornaments |
| 6 | Update responsive styles for ornaments |
| 7 | Final visual review and polish |
