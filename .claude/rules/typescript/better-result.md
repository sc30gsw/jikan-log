---
description: better-result pattern - Result.tryPromise in API layer, match pattern in hook layer, forbidden patterns
globs: ['**/*.ts', '**/*.tsx']
alwaysApply: false
---

# better-result Pattern

This project uses the [better-result](https://github.com/dmmulroy/better-result) library for type-safe error handling. Do NOT use `try-catch`.

## API Layer (mutations.ts)

Use `Result.tryPromise`. Object keys must be in alphabetical order: `catch` before `try`.

```typescript
import { Result } from 'better-result'

// CORRECT: catch comes before try (alphabetical)
export function createUser(params: CreateUserParams) {
  return Result.tryPromise({
    catch: toApiError,
    try: async () => {
      const response = await apiClient.users.$post({ body: params })
      return response.body
    },
  })
}

// WRONG: wrong key order
return Result.tryPromise({
  try: async () => { ... },  // try first is NOT allowed
  catch: toApiError,
})

// WRONG: unnecessary async wrapper (Result.tryPromise returns a Promise already)
export async function createUser(params: CreateUserParams) {
  return Result.tryPromise({ ... })
}
```

## Hook Layer (use-\*.ts)

Use `result.match()`. Object keys must be in alphabetical order: `err` before `ok`.

```typescript
// CORRECT: err comes before ok (alphabetical)
const result = await createUser(params)

result.match({
  err: (error) => {
    showError({ message: error.message, title: 'Error' })
  },
  ok: (data) => {
    showSuccess({ message: 'Created successfully' })
    onSuccess(data)
  },
})

// WRONG: if/return pattern — prone to bugs from a forgotten return
if (result.isErr()) {
  showError({ ... })
  // Missing return → ok handler executes even on error!
}
showSuccess({ ... })
onSuccess()
```

## Forbidden Patterns

```typescript
// WRONG: wrapping Result with try-catch (Result never throws)
try {
  const result = await createUser(params)
  result.match({ ... })
} catch (error) {
  // This catch block will never execute
}

// WRONG: mixing Result with try-catch
async function fetchUser(id: string) {
  try {
    return await Result.tryPromise({ ... })
  } catch (e) { ... }
}
```

## Summary

| Location               | Function            | Key Order       |
| ---------------------- | ------------------- | --------------- |
| `api/*.ts` (mutations) | `Result.tryPromise` | `catch` → `try` |
| `hooks/use-*.ts`       | `result.match`      | `err` → `ok`    |
