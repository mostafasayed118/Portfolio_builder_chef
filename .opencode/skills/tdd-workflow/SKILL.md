---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests.
metadata:
  origin: ECC
---

# Test-Driven Development Workflow

This skill ensures all code development follows TDD principles with comprehensive test coverage.

## When to Activate

- Writing new features or functionality
- Fixing bugs or issues
- Refactoring existing code
- Adding API endpoints
- Creating new components

## Core Principles

1. **Tests BEFORE Code** - ALWAYS write tests first, then implement code
2. **Coverage Requirements** - Minimum 80% coverage (unit + integration + E2E)
3. **One Assert Per Test** - Focus on single behavior
4. **Descriptive Test Names** - Explain what's tested

## TDD Workflow Steps

### Step 1: Write User Journeys
```
As a [role], I want to [action], so that [benefit]
```

### Step 2: Generate Test Cases
```typescript
describe('Feature', () => {
  it('handles expected behavior', async () => { })
  it('handles edge case gracefully', async () => { })
  it('handles error scenario', async () => { })
})
```

### Step 3: Run Tests (RED - They Should Fail)
```bash
npm test
```

### Step 4: Implement Code
Write minimal code to make tests pass.

### Step 5: Run Tests Again (GREEN)
```bash
npm test
```

### Step 6: Refactor
Improve code quality while keeping tests green.

### Step 7: Verify Coverage
```bash
npm run test:coverage
```

### Step 8: Write TDD Evidence Report
Document what was tested and the results.

## Testing Patterns

### Unit Test Pattern (Jest/Vitest)
```typescript
import { render, screen, fireEvent } from '@testing-library/react'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### API Integration Test Pattern
```typescript
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/endpoint', () => {
  it('returns data successfully', async () => {
    const request = new NextRequest('http://localhost/api/endpoint')
    const response = await GET(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

## Mocking Convex
```typescript
jest.mock('convex', () => ({
  query: jest.fn(),
  mutation: jest.fn(),
}))
```

## Test Coverage Verification
```bash
npm run test:coverage
```

### Coverage Thresholds
```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## Best Practices
1. **Write Tests First** - Always TDD
2. **Mock External Dependencies** - Isolate unit tests
3. **Test Edge Cases** - Null, undefined, empty, large
4. **Test Error Paths** - Not just happy paths
5. **Keep Tests Fast** - Unit tests < 50ms each
6. **Clean Up After Tests** - No side effects

---

**Remember**: Tests are not optional. They are the safety net that enables confident refactoring, rapid development, and production reliability.
