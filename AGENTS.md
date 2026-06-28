# Chef Bakery Portfolio — Agent Instructions

This project uses **ECC (Everything Claude Code)** — the agent harness operating system for production-grade AI-assisted development.

## Project Overview

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend:** Convex (serverless real-time database)
- **Auth:** Clerk
- **i18n:** next-intl (English + Arabic, RTL/LTR)
- **Design System:** "Dark Bakery Atelier" — golden-amber on deep warm dark, Playfair Display + Inter + Cairo

## ECC Agents Available

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring |
| architect | System design and decisions | Architecture decisions |
| code-reviewer | Code quality and maintainability | After writing/modifying code |
| security-reviewer | Vulnerability detection | Before commits, sensitive code |
| tdd-guide | Test-driven development | New features, bug fixes |
| build-error-resolver | Fix build/type errors | When build fails |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| doc-updater | Documentation | Updating docs |

## ECC Skills Available

- `tdd-workflow` — TDD methodology with 80%+ coverage
- `security-review` — Security auditing and hardening
- `coding-standards` — TypeScript/React coding conventions
- `frontend-patterns` — React/Next.js UI patterns
- `backend-patterns` — Convex/API patterns
- `e2e-testing` — Playwright E2E testing
- `verification-loop` — Quality verification gates

## Security Requirements

**Before ANY commit:**
- No hardcoded secrets (API keys, tokens, passwords)
- All user inputs validated (Zod schemas)
- Authentication checks on all admin routes
- Authorization checks before sensitive operations
- Error messages don't leak sensitive data

## Coding Standards

- **Immutability:** Always create new objects, never mutate
- **TypeScript:** Strict mode, no `any` types
- **Components:** Small, focused, reusable
- **Files:** < 400 lines typical, organize by feature
- **Error handling:** Handle at every level, user-friendly messages in UI

## Development Workflow

1. **Plan** — Use planner agent for complex features
2. **TDD** — Write tests first, implement, refactor
3. **Review** — Use code-reviewer agent after writing code
4. **Verify** — Run verification-loop before PR
5. **Commit** — Conventional commits format
