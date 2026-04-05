---
description: React/TypeScript conventions - named exports, function declarations, naming conventions, AHA programming
globs: ['**/*.ts', '**/*.tsx']
alwaysApply: false
---

# React/TypeScript Conventions

## Named Exports (default exports forbidden)

Do not use default exports except for Expo Router screen files (`app/**/*.tsx`).

```typescript
// CORRECT
export function UserTable({ users }: UserTableProps) {
  return <View>{/* ... */}</View>
}

export type UserTableProps = {
  users: User[]
}

// WRONG: default export outside of app/ screens
export default function UserTable({ users }: UserTableProps) {
  return <View>{/* ... */}</View>
}
```

## Function Declarations for Components and Hooks

Components and custom hooks must use function declaration syntax, not arrow functions.

```typescript
// CORRECT: function declaration
export function UserTable({ users }: UserTableProps) {
  return <View>{/* ... */}</View>
}

export function useUsers(options: UseUsersOptions) {
  return { users, isLoading }
}

// WRONG: arrow function
export const UserTable = ({ users }: UserTableProps) => {
  return <View>{/* ... */}</View>
}
```

## Naming Conventions

| Target                | Convention       | Examples                          |
| --------------------- | ---------------- | --------------------------------- |
| Variables / functions | lowerCamelCase   | `userName`, `getUsers`            |
| Components            | UpperCamelCase   | `UserTable`, `LoginForm`          |
| Types / interfaces    | UpperCamelCase   | `User`, `CreateUserInput`         |
| Constants             | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Files                 | kebab-case       | `use-users.ts`, `user-table.tsx`  |

## Object Key Ordering

Sort object keys alphabetically.

```typescript
// CORRECT
const colors = {
  admin: 'red',
  guest: 'gray',
  manager: 'blue',
  member: 'green',
};

// WRONG
const colors = {
  manager: 'blue',
  admin: 'red',
  member: 'green',
};
```

## AHA Programming (Avoid Hasty Abstractions)

> "Prefer duplication over the wrong abstraction." — Sandi Metz

Do not abstract prematurely. Wait until a pattern repeats at least 3 times before extracting.

```typescript
// WRONG: Premature abstraction (used only twice, with different logic per type)
function formatEntity(entity: User | Product, type: 'user' | 'product') {
  if (type === 'user') {
    /* user-specific logic */
  }
  if (type === 'product') {
    /* product-specific logic */
  }
}

// CORRECT: Tolerate duplication until the pattern is clear
function formatUser(user: User) {
  /* user-specific logic */
}
function formatProduct(product: Product) {
  /* product-specific logic */
}
```

**Guidelines:**

1. Allow duplication initially — wait until the pattern is clear
2. Consider extracting on the 3rd repetition, not the 2nd
3. Wrong abstractions are more expensive to fix than duplication

## `type` over `interface`

Use `type` for all type definitions. Do not use `interface`.

```typescript
// CORRECT
type User = {
  id: string;
  name: string;
};

type UserRole = 'admin' | 'manager' | 'member';

type UserTableProps = {
  users: User[];
  isLoading?: boolean;
};

// WRONG: interface
interface User {
  id: string;
  name: string;
}
```

## `as const satisfies` for Object Constants

Use `as const satisfies` to preserve literal types while enforcing type correctness.

```typescript
type UserRole = 'admin' | 'manager' | 'member';

// CORRECT: preserves literal types AND enforces type constraint
const roleLabels = {
  admin: 'Administrator',
  manager: 'Manager',
  member: 'Member',
} as const satisfies Record<UserRole, string>;

// WRONG: inference becomes string, loses literal type
const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  member: 'Member',
};
```
