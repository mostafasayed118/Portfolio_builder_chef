<!-- ────────────────────────────────────────────────────────────── -->
<!--  Chef Mohamed Bakery Portfolio — README                       -->
<!--  Design System: Dark Bakery Atelier                           -->
<!-- ────────────────────────────────────────────────────────────── -->

<div align="center">

```
 ██████╗██╗  ██╗███████╗███████╗    ██████╗  █████╗ ██╗  ██╗███████╗██████╗ ██╗   ██╗
██╔════╝██║  ██║██╔════╝██╔════╝    ██╔══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗╚██╗ ██╔╝
██║     ███████║█████╗  ███████╗    ██████╔╝███████║█████╔╝ █████╗  ██████╔╝ ╚████╔╝
██║     ██╔══██║██╔══╝  ╚════██║    ██╔══██╗██╔══██║██╔═██╗ ██╔══╝  ██╔══██╗  ╚██╔╝
╚██████╗██║  ██║███████╗███████║    ██████╔╝██║  ██║██║  ██╗███████╗██║  ██║   ██║
 ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝
```

### _Artisan Bakery Portfolio & Admin Dashboard_

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Convex](https://img.shields.io/badge/Convex-Backend-FF6B35?style=flat-square)](https://convex.dev/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold?style=flat-square)](./LICENSE)

A **bilingual (EN/AR)** chef portfolio website with a full admin dashboard — built with modern web technologies, featuring dark/light themes, RTL support, and a premium bakery-inspired design system.

<br/>

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [Design System](#-design-system)

---

</div>

## Features

<table>
<tr>
<td width="50%">

### Portfolio Site

- **Hero Section** — Animated entrance with floating decorative elements, gradient backgrounds, and dual CTA buttons
- **Menu Gallery** — Filterable product grid with category pills, hover overlays, and price display
- **About Section** — Chef bio with skill badges, stats, and scroll-triggered animations
- **Photo Gallery** — Masonry layout with hover captions and zoom effects
- **Testimonials** — Star-rated review cards with staggered entrance
- **Services** — Categorized service cards with icons
- **Contact** — Form with validation + WhatsApp/phone/email cards
- **Locations** — Multi-region delivery area display
- **CTA Banner** — Gradient section with floating decorative elements

</td>
<td width="50%">

### Admin Dashboard

- **Secure Auth** — Clerk-powered login with role-based access
- **Content Management** — CRUD for all sections (menu, gallery, testimonials, services, projects, locations)
- **Image Upload** — Convex file storage with drag-and-drop
- **Bilingual Editor** — Side-by-side EN/AR content editing
- **Drag & Drop** — Reorder items with dnd-kit
- **Real-time Updates** — Convex reactive queries, instant UI sync
- **Dark/Light Theme** — Full theme support across admin and site
- **RTL/LTR Toggle** — Seamless direction switching

</td>
</tr>
</table>

---

## Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Framework** | Next.js 16 (App Router) | SSR, routing, image optimization |
| **UI Library** | React 19 | Component architecture |
| **Styling** | Tailwind CSS 4 + tw-animate-css | Utility-first styling + animations |
| **Components** | shadcn/ui + Radix UI | Accessible component primitives |
| **Animations** | Motion (Framer Motion) | Scroll-triggered + gesture animations |
| **Icons** | Lucide React | Consistent SVG icon set |
| **Backend** | Convex | Real-time database, functions, file storage |
| **Auth** | Clerk | Authentication, user management |
| **i18n** | next-intl | Bilingual EN/AR with RTL support |
| **Fonts** | Playfair Display + Inter + Cairo | Serif headings + sans body + Arabic |
| **Language** | TypeScript 5 | Type safety across the stack |
| **Linting** | ESLint 9 | Code quality |
| **Design** | DESIGN.md (Stitch-compatible) | AI-readable design system |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **pnpm** (or npm/yarn)
- **Convex** account → [convex.dev](https://convex.dev)
- **Clerk** account → [clerk.com](https://clerk.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/chef-bakery-portfolio.git
cd chef-bakery-portfolio

# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Convex & Clerk keys

# Initialize Convex
npx convex dev

# In a separate terminal, start Next.js
pnpm dev
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## Project Structure

```
chef-bakery-portfolio/
├── DESIGN.md                        # AI-readable design system
├── AGENTS.md                        # Coding agent instructions
│
├── convex/                          # Backend (Convex)
│   ├── schema.ts                    # Database schema
│   ├── queries.ts                   # Read operations
│   ├── mutations.ts                 # Write operations
│   └── auth.config.ts              # Auth configuration
│
├── src/
│   ├── app/
│   │   ├── globals.css              # Design tokens & premium utilities
│   │   ├── layout.tsx               # Root layout (fonts, providers)
│   │   └── [locale]/
│   │       ├── layout.tsx           # Locale layout (i18n, direction)
│   │       ├── (site)/              # Public portfolio pages
│   │       │   ├── page.tsx         # Home (hero + menu + testimonials)
│   │       │   ├── about/           # About page
│   │       │   ├── menu/            # Full menu page
│   │       │   ├── gallery/         # Photo gallery
│   │       │   ├── services/        # Services listing
│   │       │   └── contact/         # Contact form + info
│   │       └── admin/               # Protected admin dashboard
│   │           └── (protected)/     # Clerk-guarded routes
│   │               ├── page.tsx     # Dashboard home
│   │               ├── menu/        # Menu CRUD
│   │               ├── gallery/     # Gallery CRUD
│   │               └── ...          # Other admin pages
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   │   ├── button.tsx           # (with cursor-pointer)
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...                  # 15 UI components
│   │   ├── sections/                # Page sections
│   │   │   ├── HeroSection.tsx      # Animated hero with floating decor
│   │   │   ├── MenuSection.tsx      # Filterable product grid
│   │   │   ├── AboutSection.tsx     # Chef bio with scroll animations
│   │   │   ├── GallerySection.tsx   # Masonry photo gallery
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── ContactSection.tsx   # Form + contact cards
│   │   │   ├── ContactForm.tsx      # Validated contact form
│   │   │   ├── CTABanner.tsx        # Gradient CTA section
│   │   │   ├── LocationsSection.tsx
│   │   │   └── ProjectsSection.tsx  # Career timeline
│   │   ├── layout/
│   │   │   ├── Navbar.tsx           # Sticky glass navbar
│   │   │   ├── Footer.tsx           # Footer with contact info
│   │   │   └── Header.tsx
│   │   ├── admin/                   # Admin dashboard components
│   │   └── shared/                  # Theme toggle, language toggle
│   │
│   ├── hooks/
│   │   └── useDirection.ts          # RTL/LTR detection
│   │
│   ├── i18n/                        # Internationalization
│   │   ├── routing.ts               # i18n routing config
│   │   └── request.ts               # Locale detection
│   │
│   ├── lib/
│   │   ├── utils.ts                 # cn() utility
│   │   ├── bilingual.ts             # getBilingualField() helper
│   │   └── constants.ts             # Nav links, config
│   │
│   └── types/                       # TypeScript type definitions
│
├── public/                          # Static assets
├── .opencode/skills/                # UI/UX Pro Max skill
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## Design System

This project includes a **DESIGN.md** file — an AI-readable design system document compatible with [Google Stitch](https://stitch.withgoogle.com/). Drop it into any AI coding agent to generate UI that matches the bakery's visual identity.

### Design Tokens (Quick Reference)

| Token | Dark Mode | Light Mode |
|:------|:----------|:-----------|
| Background | `oklch(16.5% 0.018 52)` | `oklch(96% 0.012 55)` |
| Surface | `oklch(20% 0.020 50)` | `oklch(94% 0.010 55)` |
| Accent | `oklch(68% 0.095 62)` | `oklch(62% 0.110 60)` |
| Text | `oklch(95% 0.012 60)` | `oklch(22% 0.020 45)` |
| Border | `oklch(28% 0.025 48)` | `oklch(84% 0.016 50)` |

### Typography

| Role | Font | Weight | Usage |
|:-----|:-----|:-------|:------|
| Headings | **Playfair Display** | 700 | All h1-h6, hero text |
| Body | **Inter** | 400-600 | Paragraphs, buttons, labels |
| Arabic | **Cairo** | 400-700 | Bilingual Arabic text |

### Key Design Principles

- **Dark-first** with warm oklch undertone (hue 50-62)
- **Golden amber accent** as the single brand signal
- **Soft UI Evolution** — subtle shadows, smooth transitions (200-400ms)
- **Glass morphism** on elevated surfaces (`backdrop-blur: 16px`)
- **No emoji icons** — Lucide SVG only
- **`cursor-pointer`** on all interactive elements
- **`prefers-reduced-motion`** respected everywhere
- **RTL/LTR** built into the design DNA

---

## Bilingual Support

The site fully supports **English** and **Arabic** with:

- RTL layout auto-detection and switching
- Bilingual content fields (`name_en` / `name_ar`)
- Cairo font for Arabic script optimization
- Direction-aware animations (slide from left/right based on locale)
- URL-based locale routing (`/en/...`, `/ar/...`)

---

## Responsive Breakpoints

| Breakpoint | Width | Grid Columns |
|:-----------|:------|:-------------|
| Mobile | `< 640px` | 1 column |
| Tablet | `640px - 1023px` | 2 columns |
| Desktop | `1024px+` | 3 columns |

All sections are fully responsive with:
- Touch-friendly targets (minimum 44px)
- Stacked layouts on mobile
- Hamburger navigation on small screens
- Responsive typography with `clamp()` scaling

---

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

---

## Acknowledgments

- **[shadcn/ui](https://ui.shadcn.com/)** — Component primitives
- **[Convex](https://convex.dev/)** — Real-time backend
- **[Clerk](https://clerk.com/)** — Authentication
- **[Lucide](https://lucide.dev/)** — Icon set
- **[UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** — Design intelligence skill
- **[awesome-design-md](https://github.com/VoltAgent/awesome-design-md)** — DESIGN.md format inspiration

---

<div align="center">

**Built with passion for the art of pastry.**

![Next.js](https://img.shields.io/badge/▲-Vercel-black?style=flat-square&logo=vercel)
![Made with Love](https://img.shields.io/badge/Made_with-❤️-red?style=flat-square)

</div>
