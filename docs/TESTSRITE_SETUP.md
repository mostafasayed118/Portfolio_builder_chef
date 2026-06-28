# TestSprite Setup Guide — Chef Mohamed Portfolio

## Prerequisites

- Node.js >= 22 (current: v24.15.0 ✅)
- TestSprite account: https://www.testsprite.com/auth/cognito/sign-up
- TestSprite API key: https://www.testsprite.com/dashboard → Settings → API Keys

---

## Step 1: MCP Server (IDE Integration)

The MCP server is already installed:

```bash
npm install @testsprite/testsprite-mcp@latest --save-dev
# Installed: v0.0.38
```

### Configuration

The `.mcp.json` file is configured at the project root:

```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "${TESTSRITE_API_KEY}"
      }
    }
  }
}
```

**To activate:** Set `TESTSRITE_API_KEY` in your environment or `.env.local`.

---

## Step 2: Web Portal Project Setup

1. Go to https://www.testsprite.com/dashboard → **Create Tests**
2. **Project Name:** `Chef Mohamed Portfolio`
3. **Upload PRD:** Upload `docs/TESTSRITE_PRD.md` (comprehensive) or `docs/TESTSRITE_QUICKSTART_PRD.md` (condensed).
   - For deeper coverage, also upload `docs/IMPLEMENTATION_BLUEPRINT.md` and `docs/ADMIN_CMS_GUIDE.md`.

### What the PRD Covers

| Document | Pages | Use Cases |
|----------|-------|-----------|
| `TESTSRITE_PRD.md` | 11 public + 11 admin = 22 pages | 40+ enumerated use cases |
| `TESTSRITE_QUICKSTART_PRD.md` | All P0 features condensed | 22 critical use cases |
| `IMPLEMENTATION_BLUEPRINT.md` | Full architecture (839 lines) | Backend schema, auth, data flow |
| `ADMIN_CMS_GUIDE.md` | Admin routes, CRUD operations | 11 editor workflows, auth flow |

---

## Step 3: Feature Extraction & Configuration

After PRD upload, TestSprite will produce a **Feature Map**.

### Verify Key Features Are Present

**Public Site (12 features):**
- [ ] Hero Section (heading, subheading, CTA, stats, image)
- [ ] About Section (bio, skills, image, RTL)
- [ ] Services Section (3 categories, cards, service lists)
- [ ] Projects / Portfolio (8 timeline entries, category badges)
- [ ] Menu Gallery (4-category filter, product cards, prices)
- [ ] Photo Gallery (masonry grid, lightbox)
- [ ] Testimonials (star ratings, carousel)
- [ ] Contact Form (validation, WhatsApp, rate limit)
- [ ] CTA Banner (dual buttons)
- [ ] Navigation (mobile hamburger, RTL awareness)
- [ ] Footer (links, contact, social)
- [ ] Bilingual Switching (EN↔AR, full RTL mirror)

**Admin CMS (12 features):**
- [ ] Clerk Login (email/password, Google OAuth, MFA)
- [ ] Auth Guard (3-layer: proxy, layout, Convex)
- [ ] Dashboard (stats + 9 quick-action cards)
- [ ] Hero Editor (bilingual textareas + image upload)
- [ ] About Editor (bio, skills, image)
- [ ] Menu CRUD (create/read/update/delete/reorder/image)
- [ ] Services CRUD (create/read/update/delete/reorder)
- [ ] Testimonials CRUD (create/read/update/delete/rating)
- [ ] Gallery (upload, reorder, delete)
- [ ] Projects CRUD (create/read/update/delete/reorder/highlight)
- [ ] Contact Editor (phone/WhatsApp/locations)
- [ ] Inbox (submissions table, read/unread)

### Configuration

| Field | Value |
|-------|-------|
| Application URL | `http://localhost:3000` (dev) or staging URL |
| Auth Type | Clerk (email/password) |
| Test Account Email | Use the project's `ADMIN_EMAIL` |
| Test Account Password | Clerk-managed — set in TestSprite credentials |
| Extra instructions | "Focus on bilingual EN/AR flows. Test admin CRUD for menu, services, projects. Verify 3-layer auth guard." |

---

## Step 4: Feature Exploration

Click **Continue** to let TestSprite crawl `localhost:3000`.
The explorer will walk each feature from the PRD and verify it against the live app.

**Prerequisites before exploration:**
```bash
# Terminal 1: Start the dev server
npm run dev

# Terminal 2 (if needed): Start Convex
npx convex dev
```

---

## Step 5: Plan Review

Prioritize test cases:

| Priority | Test Cases |
|----------|-----------|
| P0 (Must Pass) | Auth guard, Contact form submission, Menu CRUD, Projects CRUD, Bilingual switch, Hero load |
| P1 (Should Pass) | Image upload/deletion, Drag reorder, Services CRUD, Gallery, RTL layout |
| P2 (Nice to Have) | Visual regression, Empty states, Inbox, Locations CRUD |

---

## Step 6: Generate & Run

Click **Generate Tests**. TestSprite will create:
- **UI tests** (Playwright) — browser-based user journey tests
- **API tests** (Python) — backend functional/integration tests

Tests execute in TestSprite's cloud. Monitor for failures.

---

## Step 7: CI/CD Integration

A GitHub Actions workflow is pre-configured at `.github/workflows/test.yml`.

**To activate:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add secret: `TESTSRITE_API_KEY` = your TestSprite API key
3. The workflow runs lint + build on every push/PR
4. TestSprite tests run on PRs (after quality gates pass)

---

## Validation Checklist

- [ ] **Node.js 24.15.0** — compatible (>=22 required)
- [ ] **MCP server installed** — `@testsprite/testsprite-mcp@0.0.38`
- [ ] **`.mcp.json`** configured with TestSprite entry
- [ ] **`.env.local.example`** updated with `TESTSRITE_API_KEY`
- [ ] **PRD docs ready** — `TESTSRITE_PRD.md` + `TESTSRITE_QUICKSTART_PRD.md`
- [ ] **GitHub Actions workflow** — `.github/workflows/test.yml`
- [ ] **Lint: 0 errors** ✅
- [ ] **Build: passes** ✅
- [ ] **No credentials hardcoded** — API key goes to env/CI secrets only

---

## Files Created/Modified

| File | Purpose |
|------|---------|
| `.mcp.json` | MCP server config for TestSprite |
| `.env.local.example` | Added `TESTSRITE_API_KEY` placeholder |
| `docs/TESTSRITE_PRD.md` | Full PRD for TestSprite upload (40+ use cases) |
| `docs/TESTSRITE_QUICKSTART_PRD.md` | Condensed PRD (22 critical use cases) |
| `docs/TESTSRITE_SETUP.md` | This guide |
| `.github/workflows/test.yml` | CI with lint + build + TestSprite trigger |

---

**Next Action:** Sign up at testsprite.com, get API key, create project in Web Portal, upload `docs/TESTSRITE_PRD.md`, and start the wizard.
