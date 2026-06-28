---
name: frontend-patterns
description: Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices.
metadata:
  origin: ECC
---

# Frontend Development Patterns

Modern frontend patterns for React, Next.js, and performant user interfaces.

## When to Activate

- Building React components (composition, props, rendering)
- Managing state (useState, useReducer, Context)
- Implementing data fetching
- Optimizing performance (memoization, code splitting)
- Working with forms (validation, controlled inputs)
- Building accessible, responsive UI patterns
- Working with bilingual (EN/AR) layouts

## Component Patterns

### Composition Over Inheritance
```typescript
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
}

export function Card({ children, variant = 'default' }: CardProps) {
  return <div className={`card card-${variant}`}>{children}</div>
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>
}
```

### Compound Components (Tabs Pattern)
```typescript
interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function Tabs({ children, defaultTab }: {
  children: React.ReactNode
  defaultTab: string
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}

export function Tab({ id, children }: { id: string, children: React.ReactNode }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab must be used within Tabs')
  return (
    <button
      className={context.activeTab === id ? 'active' : ''}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  )
}
```

## Custom Hooks Patterns

### Debounce Hook
```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}
```

### Async Data Fetching Hook
```typescript
interface UseQueryResult<T> {
  data: T | null
  error: Error | null
  loading: boolean
  refetch: () => Promise<void>
}

export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { fetchData() }, [fetchData])

  return { data, error, loading, refetch: fetchData }
}
```

## State Management

### useReducer Pattern
```typescript
type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: DataType }
  | { type: 'SET_ERROR'; payload: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_DATA':
      return { ...state, data: action.payload, loading: false }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}
```

## Performance Best Practices

### Memoization
```typescript
import { useMemo, useCallback } from 'react'

const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => b.priority - a.priority)
}, [items])

const handleClick = useCallback(() => {
  setCount(prev => prev + 1)
}, [])
```

### Lazy Loading
```typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

export function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

## Bilingual (RTL/LTR) Patterns

### Direction-Aware Layout
```typescript
// Use logical properties
.section {
  padding-inline: 1rem;
  margin-inline-end: 0.5rem;
}

// Or Tailwind
<div className="ltr:pl-4 rtl:pr-4" />
```

### Direction Hook
```typescript
export function useDirection() {
  const locale = useLocale()
  return {
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    isRTL: locale === 'ar',
  }
}
```

## Accessibility
- All images need alt text
- Focus indicators visible
- Keyboard navigation support
- ARIA labels on interactive elements
- Color contrast meets WCAG AA
- Form inputs have associated labels

---

**Remember**: Great frontend code is accessible, performant, and a joy to use.
