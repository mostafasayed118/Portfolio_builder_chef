---
name: e2e-testing
description: Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, and flaky test strategies.
metadata:
  origin: ECC
---

# E2E Testing Patterns

Comprehensive Playwright patterns for building stable, fast, and maintainable E2E test suites.

## Test File Organization
```
tests/
├── e2e/
│   ├── auth/
│   ├── features/
│   └── api/
├── fixtures/
└── playwright.config.ts
```

## Page Object Model
```typescript
import { Page, Locator } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly heroSection: Locator
  readonly menuLink: Locator

  constructor(page: Page) {
    this.page = page
    this.heroSection = page.locator('[data-testid="hero"]')
    this.menuLink = page.locator('a[href="/menu"]')
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToMenu() {
    await this.menuLink.click()
    await this.page.waitForLoadState('networkidle')
  }
}
```

## Test Structure
```typescript
import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

test.describe('Home Page', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
  })

  test('displays hero section', async ({ page }) => {
    await expect(homePage.heroSection).toBeVisible()
  })

  test('navigates to menu page', async ({ page }) => {
    await homePage.navigateToMenu()
    await expect(page).toHaveURL(/\/menu/)
  })
})
```

## Playwright Configuration
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Flaky Test Prevention

### Race Conditions
```typescript
// Bad: assumes element is ready
await page.click('button')

// Good: auto-wait locator
await page.locator('button').click()
```

### Network Timing
```typescript
// Bad: arbitrary timeout
await page.waitForTimeout(5000)

// Good: wait for specific condition
await page.waitForResponse(resp => resp.url().includes('/api/data'))
```

## CI/CD Integration
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

**Remember**: Reliable E2E tests are the safety net for critical user flows.
