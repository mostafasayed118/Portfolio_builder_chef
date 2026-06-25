# Design System — Chef Mohamed Bakery Portfolio

## 1. Visual Theme & Atmosphere

A **warm, artisanal luxury** design system that evokes the tactile feel of a premium patisserie — the warmth of freshly baked bread, the elegance of hand-crafted pastries, and the intimacy of a chef's personal portfolio. The canvas is a deep, dark surface (`oklch(16.5% 0.018 52)`) that lets golden-amber accents glow like caramel under a pastry lamp.

The design philosophy is **"dark bakery atelier"** — a moody, sophisticated dark mode as default that makes food photography pop and gold accents shimmer. Light mode switches to a warm cream canvas for daytime browsing. Both modes share the same warm undertone family (hue 50-62 in oklch), ensuring the bakery identity persists across themes.

Typography pairs **Playfair Display** (a high-contrast serif with editorial elegance) for headings with **Inter** (a clean humanist sans) for body text, and **Cairo** for Arabic/bilingual support. The serif headings evoke the craftsmanship of a pastry chef's handwritten menu; the sans body ensures modern readability.

Surfaces breathe through soft rounded geometry. Cards take `12-16px` radius. Buttons are `8px` rounded rectangles with `cursor-pointer` on all interactive elements. The accent glow (`0 0 20px oklch(68% 0.095 62 / 0.15)`) is the signature depth move — a warm halo that appears on hover states and active CTAs.

**Key Characteristics:**
- Dark-first canvas with warm oklch undertone (hue 50-62) — not cold gray
- Golden-amber accent (`oklch(68% 0.095 62)`) as the single brand signal
- Playfair Display serif headings + Inter sans body + Cairo Arabic — three typefaces, three contexts
- Soft UI Evolution style: subtle shadows, smooth transitions (200-300ms), gentle hover states
- Glass morphism on elevated surfaces (`backdrop-blur: 16px`)
- Bilingual RTL/LTR support built into the design DNA
- `prefers-reduced-motion` respected everywhere
- No emoji icons — all SVG from Lucide icon set
- `cursor-pointer` on every clickable element

## 2. Color Palette & Roles

### Dark Mode (Default)

| Role | oklch | Hex Approx | Usage |
|------|-------|------------|-------|
| Background | `oklch(16.5% 0.018 52)` | `#1a1510` | Page canvas — deep warm dark |
| Surface | `oklch(20% 0.020 50)` | `#26201a` | Card backgrounds, panels |
| Surface Elevated | `oklch(23% 0.022 50)` | `#302820` | Hovered cards, dropdowns, modals |
| Border | `oklch(28% 0.025 48)` | `#3d3228` | Subtle dividers, card borders |
| Accent | `oklch(68% 0.095 62)` | `#c8943a` | Primary brand — golden amber |
| Accent Hover | `oklch(72% 0.100 62)` | `#d4a24a` | Hover/active accent state |
| Text Primary | `oklch(95% 0.012 60)` | `#f5f0e8` | Headings, primary body text |
| Text Secondary | `oklch(68% 0.025 52)` | `#8a7a68` | Descriptions, metadata |
| Text Muted | `oklch(44% 0.030 42)` | `#5a4a3a` | Placeholders, disabled text |
| Success | `oklch(68% 0.140 162)` | `#3aaa6a` | Positive feedback |
| Error | `oklch(60% 0.160 26)` | `#c44030` | Destructive actions |

### Light Mode

| Role | oklch | Hex Approx | Usage |
|------|-------|------------|-------|
| Background | `oklch(96% 0.012 55)` | `#f8f5f0` | Warm cream canvas |
| Surface | `oklch(94% 0.010 55)` | `#f2efe8` | Card backgrounds |
| Surface Elevated | `oklch(91% 0.014 55)` | `#eae5dc` | Hovered cards |
| Border | `oklch(84% 0.016 50)` | `#d8d0c4` | Dividers |
| Accent | `oklch(62% 0.110 60)` | `#b8842a` | Primary brand — deeper gold for contrast |
| Text Primary | `oklch(22% 0.020 45)` | `#2a2218` | Headings |
| Text Secondary | `oklch(48% 0.018 45)` | `#6a5a48` | Body text |

### Gradient System

No structural gradients — surfaces are solid color-block throughout. The accent glow effect uses a subtle radial gradient for depth:
```css
background: radial-gradient(circle, oklch(68% 0.095 62 / 0.25), transparent 70%);
```

## 3. Typography Rules

### Font Families

| Role | Font | Source | Usage |
|------|------|--------|-------|
| Heading | Playfair Display | Google Fonts | All headings (h1-h6), hero text, section titles |
| Body | Inter | Google Fonts | Body text, buttons, labels, metadata |
| Arabic | Cairo | Google Fonts | Arabic/bilingual text, RTL surfaces |

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Display | `clamp(2.5rem, 5vw, 4.5rem)` | 700 | 1.1 | -0.02em | Hero headings |
| H1 | `2.25rem` / `3rem` / `3.5rem` | 700 | 1.2 | -0.01em | Page titles (responsive) |
| H2 | `1.875rem` / `2.25rem` / `2.5rem` | 700 | 1.2 | -0.01em | Section headings |
| H3 | `1.25rem` / `1.5rem` | 600 | 1.3 | 0 | Subsection headings |
| Body Large | `1.125rem` / `1.25rem` | 400 | 1.7 | 0 | Hero subheadings, intro copy |
| Body | `1rem` (16px) | 400 | 1.6 | 0 | Default body text |
| Body Small | `0.875rem` (14px) | 400 | 1.5 | 0 | Metadata, captions, badges |
| Micro | `0.75rem` (12px) | 400-500 | 1.4 | 0 | Labels, tiny badges |
| Button | `0.875rem` / `1rem` | 500-600 | 1.2 | 0 | All button labels |

### Principles

- **Serif for personality, sans for clarity.** Playfair Display carries the artisan brand voice; Inter ensures readability at all sizes.
- **Responsive type scaling.** Headings use `clamp()` or Tailwind responsive prefixes (`text-3xl md:text-4xl lg:text-5xl`).
- **Arabic gets its own typeface.** Cairo is optimized for Arabic script — never force Inter on Arabic text.
- **Body text never goes pure black.** It uses `oklch(22% 0.020 45)` in light mode, `oklch(95% 0.012 60)` in dark mode — both warm-tinted.
- **`-0.01em` letter-spacing on headings** gives Playfair Display its editorial confidence.

## 4. Component Stylings

### Buttons

**Primary Filled (CTA)**
- Background: `var(--accent)` — golden amber
- Text: `var(--background)` — dark/light contrast
- Radius: `0.75rem` (12px)
- Padding: `h-11 px-8` (44px height, 32px horizontal)
- Font: Inter, 16px, weight 500-600
- Hover: `var(--accent-hover)` + `box-shadow: var(--shadow-glow)`
- Active: subtle `translateY(1px)`
- Transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- **`cursor-pointer` mandatory on all buttons**

**Primary Outlined**
- Background: transparent
- Text: `var(--accent)`
- Border: `1px solid oklch(68% 0.095 62 / 0.3)`
- Hover: `bg-accent/10`

**Ghost**
- Background: transparent
- Text: `var(--text-muted)`
- Hover: `bg-surface-elevated`, `text-accent`

**Icon Button**
- Size: `32px` (h-8 w-8)
- Radius: `0.5rem` (8px)
- Hover: `bg-accent/10`, `text-accent`

### Cards

**Default Card**
- Background: `var(--surface)`
- Radius: `12-16px`
- Border: `1px solid var(--border)` at 40-50% opacity
- Shadow: `var(--shadow-card)` — subtle lift
- Hover: border shifts to `accent/20-25%`, shadow intensifies to `var(--shadow-card)`
- Transition: `all 0.3-0.4s`

**Elevated Card (Modal/Dropdown)**
- Background: `var(--surface-elevated)`
- Shadow: `var(--shadow-float)` — stronger lift
- Backdrop: `blur(16px)` for glass effect

**Menu Item Card**
- Image area: `aspect-[4/3]` with `bg-gradient-to-br from-accent/8 to-surface-elevated`
- Image hover: `scale(1.1)` over `700ms`
- Hover overlay: gradient from-t with action buttons
- Price: `text-accent font-bold tabular-nums`

### Inputs

- Background: `var(--surface-elevated)` at 50% opacity
- Border: `1px solid var(--border)` at 40%
- Radius: `0.75rem` (12px)
- Height: `44px` (h-11)
- Focus: `border-accent`, `ring-2 ring-accent/15`
- Transition: `all 0.2s`
- Placeholder: `text-muted-foreground/50`

### Navigation

**Navbar (Sticky)**
- Transparent by default, glass on scroll: `bg-background/80 backdrop-blur-xl`
- Border: `border-b border-border/40` on scroll
- Height: `64px` (h-16)
- Logo: ChefHat icon + brand name in Playfair Display
- Links: `text-sm font-medium`, active state with bottom accent bar
- CTA: filled accent button with glow shadow

**Mobile Nav (Sheet)**
- Slide from right (or left for RTL)
- Full-height overlay
- Links at `text-lg font-medium`

### Image Treatment

- **Hero photography**: Full-cover with `object-cover`, `priority` loading
- **Menu thumbnails**: `aspect-[4/3]`, `loading="lazy"`, hover scale
- **Gallery**: Masonry columns (`columns-2 md:columns-3 lg:columns-4`), hover overlay with caption
- **About portrait**: `aspect-square`, decorative frame on hover
- **Image fade-in**: `transition-transform duration-700 ease-out`
- **Hover scale**: `group-hover:scale-105` or `group-hover:scale-110`

## 5. Layout Principles

### Spacing System

Tailwind-based semantic scale:

| Token | Pixels | Typical Use |
|-------|--------|-------------|
| `1` | 4px | Tightest gaps |
| `2` | 8px | Small gaps, inline padding |
| `3` | 12px | Card inner padding (compact) |
| `4` | 16px | Default gap, card padding |
| `5` | 20px | Form field spacing |
| `6` | 24px | Section inner spacing |
| `8` | 32px | Card padding (generous) |
| `10` | 40px | Section gaps |
| `12` | 48px | Section padding |
| `16` | 64px | Large section padding |
| `24` | 96px | Section vertical padding |

### Container

- Max width: `1200px` (`container mx-auto`)
- Horizontal padding: `16px` (`px-4`)
- Responsive: same padding scales with viewport

### Grid

- Menu: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Gallery: CSS columns masonry (`columns-2 md:columns-3 lg:columns-4`)
- Testimonials: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Contact: `grid-cols-1 lg:grid-cols-5` (2:3 split)
- Services: `grid-cols-1 md:grid-cols-3`

### Whitespace Philosophy

Sections use generous `py-24` (96px) vertical padding. Content breathes through whitespace, not dividers. Subtle gradient backgrounds (`bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent`) mark section transitions.

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Card | `0 2px 12px oklch(16.5% 0.018 52 / 0.15)` | Default content cards |
| Card Hover | `var(--shadow-card)` + border glow | Hovered cards |
| Accent Glow | `0 0 40px oklch(68% 0.095 62 / 0.12), 0 0 80px oklch(68% 0.095 62 / 0.06)` | CTA buttons, active elements |
| Float | `0 20px 60px oklch(16.5% 0.018 52 / 0.3), 0 8px 20px oklch(16.5% 0.018 52 / 0.15)` | Floating elements, modals |
| Glass | `backdrop-blur(16px)` + semi-transparent bg | Navbar on scroll, overlays |

**Shadow philosophy:** Layered low-alpha shadows with warm undertone. Never heavy — always whisper-soft with 2 layers (direct + ambient). The accent glow is the signature elevation for interactive elements.

## 7. Do's and Don'ts

### Do
- Use warm oklch colors (hue 45-62) throughout — the bakery warmth is essential
- Keep `cursor-pointer` on all interactive elements
- Apply smooth transitions (200-400ms) on all state changes
- Respect `prefers-reduced-motion` — disable animations when active
- Use Lucide icons exclusively — consistent icon set
- Support RTL layout with `useDirection()` hook
- Use `aspect-[4/3]` for menu images, `aspect-square` for portraits
- Apply `group` + `group-hover:` patterns for card hover effects
- Use `line-clamp-2` for description text overflow
- Include `loading="lazy"` on below-fold images

### Don't
- Don't use pure black (`#000`) or pure white (`#fff`) — always use warm-tinted oklch values
- Don't use emoji as icons — SVG only
- Don't skip hover states on interactive elements
- Don't use `transition-all` without duration — always specify `duration-200` to `duration-400`
- Don't forget `aria-label` on icon-only buttons
- Don't use `scale` transforms that cause layout shift — use `transform` on contained elements only
- Don't mix serif and sans in the same heading — Playfair for headings, Inter for everything else
- Don't use gradients for surfaces — the system is solid color-block

## 8. Responsive Behavior

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Mobile | < 640px | Single column, hamburger nav, stacked sections |
| Tablet | 640-1023px | 2-column grids, side-by-side hero |
| Desktop | 1024px+ | 3-column grids, full layout, generous spacing |

### Touch Targets

- All buttons: minimum `44px` height (`h-11`)
- Icon buttons: `32px` with adequate spacing
- Category pills: `py-2.5` (40px effective)
- Nav links: `py-2` with `px-3` (adequate tap area)

### Collapsing Strategy

- Hero: 2-column → stacked on mobile
- Menu grid: 3 → 2 → 1 columns
- Gallery: 4 → 3 → 2 columns
- Contact: 5-col split → stacked
- Services: 3 → 1 column
- Navbar: inline links → hamburger sheet

## 9. Agent Prompt Guide

### Quick Color Reference

- Page canvas (dark): `oklch(16.5% 0.018 52)`
- Page canvas (light): `oklch(96% 0.012 55)`
- Card surface (dark): `oklch(20% 0.020 50)`
- Accent/CTA: `oklch(68% 0.095 62)` (dark) / `oklch(62% 0.110 60)` (light)
- Heading text (dark): `oklch(95% 0.012 60)`
- Body text (dark): `oklch(68% 0.025 52)`
- Border (dark): `oklch(28% 0.025 48)`

### Example Prompts

1. "Create a menu item card with dark surface background, 4:3 aspect ratio image area with subtle accent gradient, hover scale effect on the image, category badge with accent border, and price in accent color. Apply cursor-pointer and smooth 300ms transitions."

2. "Build a hero section with full-height layout, gradient background overlay, floating decorative blobs with gentle animation, Playfair Display heading at 4xl-7xl responsive size, accent badge label, and two CTA buttons (filled + outlined). Support RTL with directional animation."

3. "Design a testimonials section with cards on a subtle gradient background, decorative quote icon, star ratings in accent color, avatar fallback with accent tint, and staggered entrance animations respecting prefers-reduced-motion."
