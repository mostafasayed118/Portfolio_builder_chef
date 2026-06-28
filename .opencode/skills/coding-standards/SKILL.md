---
name: coding-standards
description: Baseline cross-project coding conventions for naming, readability, immutability, and code-quality review.
metadata:
  origin: ECC
---

# Coding Standards & Best Practices

Baseline coding conventions applicable across projects.

## When to Activate

- Starting a new project or module
- Reviewing code for quality and maintainability
- Refactoring existing code to follow conventions
- Enforcing naming, formatting, or structural consistency

## Code Quality Principles

### 1. Readability First
- Clear variable and function names
- Self-documenting code preferred over comments
- Consistent formatting

### 2. KISS (Keep It Simple, Stupid)
- Simplest solution that works
- Avoid over-engineering
- No premature optimization

### 3. DRY (Don't Repeat Yourself)
- Extract common logic into functions
- Create reusable components
- Share utilities across modules

### 4. YAGNI (You Aren't Gonna Need It)
- Don't build features before they're needed
- Add complexity only when required

## TypeScript/JavaScript Standards

### Variable Naming
```typescript
// PASS: Descriptive names
const marketSearchQuery = 'election'
const isUserAuthenticated = true

// FAIL: Unclear names
const q = 'election'
const flag = true
```

### Function Naming
```typescript
// PASS: Verb-noun pattern
async function fetchMarketData(marketId: string) {}
function isValidEmail(email: string): boolean {}

// FAIL: Unclear or noun-only
async function market(id: string) {}
function email(e) {}
```

### Immutability Pattern (CRITICAL)
```typescript
// PASS: ALWAYS use spread operator
const updatedUser = { ...user, name: 'New Name' }
const updatedArray = [...items, newItem]

// FAIL: NEVER mutate directly
user.name = 'New Name'
items.push(newItem)
```

### Error Handling
```typescript
// PASS: Comprehensive error handling
async function fetchData(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}
```

### Async/Await Best Practices
```typescript
// PASS: Parallel execution when possible
const [users, markets, stats] = await Promise.all([
  fetchUsers(), fetchMarkets(), fetchStats()
])

// FAIL: Sequential when unnecessary
const users = await fetchUsers()
const markets = await fetchMarkets()
```

### Type Safety
```typescript
// PASS: Proper types
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
}

// FAIL: Using 'any'
function getMarket(id: any): Promise<any> {}
```

## File Organization

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── (routes)/          # Pages
├── components/            # React components
│   ├── ui/               # Generic UI components
│   └── sections/         # Page sections
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configs
├── types/                # TypeScript types
└── i18n/                 # Translations
```

## Code Smell Detection

### 1. Long Functions
```typescript
// FAIL: Function > 50 lines
// PASS: Split into smaller functions
```

### 2. Deep Nesting
```typescript
// FAIL: 5+ levels of nesting
// PASS: Early returns
if (!user) return
if (!user.isAdmin) return
```

### 3. Magic Numbers
```typescript
// FAIL: Unexplained numbers
if (retryCount > 3) {}

// PASS: Named constants
const MAX_RETRIES = 3
if (retryCount > MAX_RETRIES) {}
```

---

**Remember**: Code quality is not negotiable. Clear, maintainable code enables rapid development and confident refactoring.
