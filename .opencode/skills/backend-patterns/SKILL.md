---
name: backend-patterns
description: Backend architecture patterns, API design, database optimization, and server-side best practices for Next.js API routes and Convex.
metadata:
  origin: ECC
---

# Backend Development Patterns

Backend architecture patterns and best practices for scalable server-side applications.

## When to Activate

- Designing API endpoints
- Implementing data access layers
- Optimizing database queries
- Adding caching strategies
- Structuring error handling and validation
- Building middleware (auth, logging, rate limiting)

## API Design Patterns

### RESTful API Structure
```
GET    /api/resource              # List resources
GET    /api/resource/:id          # Get single resource
POST   /api/resource              # Create resource
PATCH  /api/resource/:id          # Update resource
DELETE /api/resource/:id          # Delete resource
```

### Response Format
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// Success
return NextResponse.json({
  success: true,
  data: items,
  meta: { total: 100, page: 1, limit: 10 }
})

// Error
return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })
```

## Convex Patterns (This Project)

### Query Pattern
```typescript
import { query } from './_generated/server'
import { v } from 'convex/values'

export const get = query({
  args: { id: v.id('menuItems') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('menuItems').collect()
  },
})
```

### Mutation Pattern
```typescript
import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthenticated')

    return await ctx.db.insert('menuItems', {
      ...args,
      createdAt: Date.now(),
    })
  },
})
```

### Authorization Pattern (Clerk + Convex)
```typescript
export const requireAdmin = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error('Unauthenticated')

  const user = await ctx.db
    .query('users')
    .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
    .unique()

  if (!user || !user.isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }

  return user
}
```

## Error Handling Patterns

### Centralized Error Handler
```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
  }
}

export function errorHandler(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    )
  }

  console.error('Unexpected error:', error)
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}
```

### Retry with Exponential Backoff
```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
      }
    }
  }
  throw lastError!
}
```

## Database Patterns

### Query Optimization
- Select only needed columns, not `select *`
- Use appropriate indexes
- Batch fetch related data to avoid N+1
- Limit result sets

### N+1 Query Prevention
```typescript
// BAD: N+1 query problem
const items = await getItems()
for (const item of items) {
  item.creator = await getUser(item.creatorId)
}

// GOOD: Batch fetch
const items = await getItems()
const creatorIds = items.map(i => i.creatorId)
const creators = await getUsers(creatorIds)
const creatorMap = new Map(creators.map(c => [c.id, c]))
items.forEach(item => {
  item.creator = creatorMap.get(item.creatorId)
})
```

## Rate Limiting
- Use platform-native rate limiters
- IP-based and user-based rate limiting
- Stricter limits on expensive operations

---

**Remember**: Backend patterns enable scalable, maintainable server-side applications.
