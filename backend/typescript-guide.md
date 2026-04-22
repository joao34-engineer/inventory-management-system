# TypeScript Mastery Guide — Applied to Stock Manager

This guide maps the most impactful lessons from **Effective TypeScript (2nd Ed.)** directly to code you will write in this project. Each section references the book Item so you can read the theory, then immediately practice it here.

---

## 🗺️ How to Use This Guide

1. **Read a section below** → it tells you _which book Item_ to read.
2. **Read that Item in the book** → understand the theory.
3. **Come back here** → apply it to a specific file in your Stock Manager.
4. **Check it off** when done.

---

## Phase 1: Foundations (Do these FIRST)

### ☐ 1.1 — Configure `tsconfig.json` Strictly
> 📖 Book: **Item 2 — Know Which TypeScript Options You're Using**

Most beginners use loose TypeScript settings. Interviewers will check your `tsconfig.json`.

**Practice:** Create `backend/tsconfig.json` with these strict options:
```jsonc
{
  "compilerOptions": {
    "strict": true,              // Enables ALL strict checks
    "noUncheckedIndexedAccess": true, // Arrays could be undefined
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```
**Why it matters:** `strict: true` alone enables `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, and more. This is what separates a junior from a senior TS developer.

---

### ☐ 1.2 — Prefer Type Annotations over Type Assertions
> 📖 Book: **Item 9 — Prefer Type Annotations to Type Assertions**

**Bad (assertion — hides bugs):**
```typescript
const product = {} as Product  // No error, but product.name is undefined!
```

**Good (annotation — catches bugs):**
```typescript
const product: Product = {}  // TS Error: 'name' is missing
```

**Practice:** When building your `products.service.ts`, always annotate return types. Never use `as`.

---

### ☐ 1.3 — Don't Use `any`. Use `unknown` Instead
> 📖 Book: **Item 5 — Limit Use of the any Type**
> 📖 Book: **Item 46 — Use unknown Instead of any for Values with an Unknown Type**

**Bad:**
```typescript
function parseBody(body: any) {
  return body.name  // No safety. Could crash at runtime.
}
```

**Good:**
```typescript
function parseBody(body: unknown): Product {
  const parsed = productSchema.parse(body)  // Zod validates at runtime
  return parsed  // Now it's safe and typed
}
```

**Practice:** In your controllers, `req.body` is essentially `unknown`. Always validate it with Zod before using it. This is exactly what your `env.ts` file does with environment variables!

---

## Phase 2: Type Design (The core of the book)

### ☐ 2.1 — Types That Always Represent Valid States
> 📖 Book: **Item 29 — Prefer Types That Always Represent Valid States**

This is the **single most important Item** in the entire book. Your types should make invalid states impossible to represent.

**Bad (allows invalid states):**
```typescript
interface Product {
  name: string
  price: number
  status: string       // "active"? "deleted"? "banana"? Anything goes.
  discount: number     // What if discount > price? TS won't stop you.
}
```

**Good (invalid states are impossible):**
```typescript
// Status is constrained to known values
type ProductStatus = 'active' | 'inactive' | 'discontinued'

interface Product {
  name: string
  price: number
  status: ProductStatus  // Can only be one of 3 values
}
```

**Practice:** When designing `products.schema.ts`, use string literal unions for columns like `status` or `category` instead of plain `string`.

#### 💎 Robust Example: String Literal Unions + `as const`
Instead of just listing strings, seniors use an array with `as const` to drive both the **Type** and the **Logic** from a single source of truth.

```typescript
// 1. Define the valid values in a constant array
export const PRODUCT_STATUSES = ['active', 'out_of_stock', 'discontinued'] as const

// 2. Derive the Type from the array (No manual typing!)
export type ProductStatus = (typeof PRODUCT_STATUSES)[number] 
// ^? type ProductStatus = "active" | "out_of_stock" | "discontinued"

// 3. Use it in Drizzle Schema
export const products = pgTable('products', {
  status: text('status').$type<ProductStatus>().default('active'),
})

// 4. Benefit: You can easily validate or list them elsewhere
const dropdownOptions = PRODUCT_STATUSES.map(s => s.toUpperCase())
```


---

### ☐ 2.2 — Be Liberal in What You Accept, Strict in What You Produce
> 📖 Book: **Item 30 — Be Liberal in What You Accept and Strict in What You Produce**

Your **Service** should accept flexible input types but return strict, precise types.

**Practice:**
```typescript
// INPUT: Accept a flexible type (what the API consumer sends)
type CreateProductInput = {
  name: string
  price: number
  quantity?: number  // Optional — we default to 0
}

// OUTPUT: Return a strict type (what the DB gives back)
type Product = {
  id: string
  name: string
  price: number
  quantity: number     // Always a number, never undefined
  createdAt: Date
}

// The service bridges the gap
class ProductService {
  static async create(input: CreateProductInput): Promise<Product> {
    // ...
  }
}
```

---

### ☐ 2.3 — Push Null Values to the Perimeter
> 📖 Book: **Item 33 — Push Null Values to the Perimeter of Your Types**

Don't let `null` or `undefined` leak deep into your code. Handle them at the edges (controllers, DB queries).

**Bad:**
```typescript
class ProductService {
  // null leaks everywhere — every caller must handle it
  static async getById(id: string): Promise<Product | null> { ... }
}

// In the controller — must check for null
const product = await ProductService.getById(id)
if (!product) { ... }  
// And then in every other place that calls getById...
```

**Good:**
```typescript
class ProductService {
  // Throws if not found — callers get a clean Product
  static async getById(id: string): Promise<Product> {
    const product = await db.query(...)
    if (!product) throw new NotFoundError(`Product ${id} not found`)
    return product
  }
}

// In the controller — clean and simple
const product = await ProductService.getById(id)
res.json(product)  // Always a Product, never null
```

**Practice:** Create a `NotFoundError` class in `shared/errors.ts` and use it in your services.

---

### ☐ 2.4 — Use `readonly` to Prevent Accidental Mutation
> 📖 Book: **Item 14 — Use readonly to Avoid Errors Associated with Mutation**

**Practice:**
```typescript
// Service input should be readonly — services must not mutate the request
static async create(input: Readonly<CreateProductInput>): Promise<Product> {
  // input.name = 'hacked'  // TS Error! Cannot assign to read-only property
}
```

---

## Phase 3: Generics & Advanced Patterns

### ☐ 3.1 — Generics as Functions Between Types
> 📖 Book: **Item 50 — Think of Generics as Functions Between Types**

Think of `<T>` as a function parameter, but for types.

**Practice:** Create a generic API response type:
```typescript
// A reusable response wrapper
type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}

// Usage in controllers
res.json({ success: true, data: product } satisfies ApiResponse<Product>)
```

---

### ☐ 3.2 — Exhaustiveness Checking with `never`
> 📖 Book: **Item 59 — Use Never Types to Perform Exhaustiveness Checking**

This ensures your `switch` statements handle ALL cases. If you add a new product status later, TypeScript will force you to handle it.

**Practice:**
```typescript
function getStatusLabel(status: ProductStatus): string {
  switch (status) {
    case 'active': return '✅ Active'
    case 'inactive': return '⏸ Inactive'
    case 'discontinued': return '❌ Discontinued'
    default:
      // If you add a new status and forget to handle it,
      // TypeScript will give you an error HERE
      const _exhaustive: never = status
      throw new Error(`Unhandled status: ${_exhaustive}`)
  }
}
```

---

## Phase 4: Professional Practices

### ☐ 4.1 — Use TSDoc for API Comments
> 📖 Book: **Item 68 — Use TSDoc for API Comments**

Don't write comments that repeat the type. Write comments that explain WHY.

**Bad:**
```typescript
/** price is a number */
price: number
```

**Good:**
```typescript
/**
 * Price in cents to avoid floating-point issues.
 * @example 1999 represents $19.99
 */
price: number
```

**Practice:** Add TSDoc to all your Service methods.

---

### ☐ 4.2 — Use `satisfies` for Type-Safe Configuration
> 📖 Book: **Item 20 — Understand How a Variable Gets Its Type**

The `satisfies` operator (TS 4.9+) lets you validate a value matches a type without widening it.

**Practice:** Use it in your route definitions:
```typescript
const productRoutes = {
  list:   'GET    /products',
  create: 'POST   /products',
  get:    'GET    /products/:id',
  update: 'PUT    /products/:id',
  delete: 'DELETE /products/:id',
} as const satisfies Record<string, string>
```

---

## 📂 Files Where You'll Apply Each Concept

| File | Concepts Applied |
| :--- | :--- |
| `tsconfig.json` | Item 2 (strict config) |
| `src/env.ts` | Item 29 (valid states), Item 46 (unknown → validated) |
| `modules/products/products.schema.ts` | Item 29 (literal unions), Item 14 (readonly) |
| `modules/products/products.service.ts` | Item 30 (liberal in, strict out), Item 33 (push nulls out), Item 9 (annotations) |
| `modules/products/products.controller.ts` | Item 46 (unknown body → Zod), Item 5 (no any) |
| `shared/errors.ts` | Item 59 (never for exhaustiveness) |
| `shared/types.ts` | Item 50 (generic ApiResponse) |

---

## 🎯 Interview Power Moves
When an interviewer asks "How do you use TypeScript?", these are the answers that stand out:

1. **"I use `strict: true` and `noUncheckedIndexedAccess`"** — Shows you care about safety.
2. **"I validate unknown input at the boundary with Zod and push null to the perimeter"** — Shows you understand Item 33 and 46.
3. **"My types make invalid states impossible to represent"** — Shows you read Item 29 (the most important pattern).
4. **"I use `satisfies` and `as const` to get precise inference"** — Shows you understand TS deeply.
5. **"I use `never` for exhaustiveness checking"** — Shows advanced knowledge.

> **Tip:** You don't need to memorize all 83 items. Master the ones in this guide and you'll be ahead of 90% of TypeScript developers.
