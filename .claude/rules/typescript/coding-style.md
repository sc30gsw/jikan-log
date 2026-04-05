---
description: TypeScript/JavaScript coding style - types, immutability, error handling, SSoT, result pattern, utility types, comments, file naming
globs: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
alwaysApply: false
---

# TypeScript/JavaScript Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with TypeScript/JavaScript specific content.

## Types and Interfaces

Use types to make public APIs, shared models, and component props explicit, readable, and reusable.

### Public APIs

- Add parameter and return types to exported functions, shared utilities, and public class methods
- Let TypeScript infer obvious local variable types
- Extract repeated inline object shapes into named types or interfaces

```typescript
// WRONG: Exported function without explicit types
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`;
}

// CORRECT: Explicit types on public APIs
type User = {
  firstName: string;
  lastName: string;
};

export function formatUser(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}
```

### Use `type`, Not `interface`

Always use `type`. Do not use `interface`. See [react-conventions.md](./react-conventions.md) for full details.

```typescript
// CORRECT
type User = {
  id: string;
  email: string;
};

type UserRole = 'admin' | 'member';
type UserWithRole = User & { role: UserRole };

// WRONG
interface User {
  id: string;
  email: string;
}
```

- Prefer string literal unions over `enum` unless interoperability requires it

### Avoid `any`

- Avoid `any` in application code
- Use `unknown` for external or untrusted input, then narrow it safely
- Use generics when a value's type depends on the caller

```typescript
// WRONG: any removes type safety
function getErrorMessage(error: any) {
  return error.message;
}

// CORRECT: unknown forces safe narrowing
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
}
```

### React Props

- Define component props with a named `type` (not `interface`)
- Type callback props explicitly
- Do not use `React.FC`
- For 1-2 props derivable from an existing type, use utility types directly

```typescript
type User = {
  id: string
  email: string
}

// For 3+ props, define a named type
type UserCardProps = {
  user: User
  onSelect: (id: string) => void
}

function UserCard({ user, onSelect }: UserCardProps) {
  return <Pressable onPress={() => onSelect(user.id)}>{user.email}</Pressable>
}

// For 1-2 props, use utility types directly
function UserName({ name }: Pick<User, 'name'>) {
  return <Text>{name}</Text>
}
```

### JavaScript Files

- In `.js` and `.jsx` files, use JSDoc when types improve clarity and a TypeScript migration is not practical
- Keep JSDoc aligned with runtime behavior

```javascript
/**
 * @param {{ firstName: string, lastName: string }} user
 * @returns {string}
 */
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`;
}
```

## Immutability

Use spread operator for immutable updates:

```typescript
interface User {
  id: string;
  name: string;
}

// WRONG: Mutation
function updateUser(user: User, name: string): User {
  user.name = name; // MUTATION!
  return user;
}

// CORRECT: Immutability
function updateUser(user: Readonly<User>, name: string): User {
  return {
    ...user,
    name,
  };
}
```

## Error Handling

Use async/await with try-catch and narrow unknown errors safely:

```typescript
interface User {
  id: string;
  email: string;
}

declare function riskyOperation(userId: string): Promise<User>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
}

const logger = {
  error: (message: string, error: unknown) => {
    // Replace with your production logger (for example, pino or winston).
  },
};

async function loadUser(userId: string): Promise<User> {
  try {
    const result = await riskyOperation(userId);
    return result;
  } catch (error: unknown) {
    logger.error('Operation failed', error);
    throw new Error(getErrorMessage(error));
  }
}
```

## Input Validation

Use Zod for schema-based validation and infer types from the schema:

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
});

type UserInput = z.infer<typeof userSchema>;

const validated: UserInput = userSchema.parse(input);
```

## Console.log

- No `console.log` statements in production code
- Use proper logging libraries instead
- See hooks for automatic detection

## SSoT (Single Source of Truth) Types

When a source type already exists, always derive from it. Never duplicate type definitions:

```typescript
// WRONG: Duplicating fields manually
type UserCardProps = {
  id: string;
  name: string;
  email: string;
};

// CORRECT: Derive from the SSoT type
import type { User } from '~/types/user';
type UserCardProps = Pick<User, 'id' | 'name' | 'email'>;
```

## Error Handling: Result Pattern

Do NOT use `try-catch`. Use the Result pattern instead:

```typescript
// WRONG: try-catch
async function fetchUser(id: string) {
  try {
    return await api.getUser(id);
  } catch (error) {
    return null;
  }
}

// CORRECT: Result pattern
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function fetchUser(id: string): Promise<Result<User>> {
  const response = await api.getUser(id);
  if (!response.ok) {
    return { ok: false, error: new Error(`Failed to fetch user: ${id}`) };
  }
  return { ok: true, value: response.data };
}

// Caller
const result = await fetchUser(id);
if (!result.ok) {
  // handle error
  return;
}
// result.value is safely typed as User
```

## TypeScript Utility Types

Actively use `Record`, `Pick`, `Omit`, `Partial`, `Required`, `ReturnType`, `Parameters`, etc.:

```typescript
// WRONG: Manual re-definition
interface UpdateUserDto {
  name?: string;
  email?: string;
}

// CORRECT: Derive with utility types
type UpdateUserDto = Partial<Pick<User, 'name' | 'email'>>;

// Record example
type Role = 'admin' | 'user' | 'guest';
type RolePermissions = Record<Role, string[]>;
```

## Comment Policy

Write comments only to explain **why**, never what:

```typescript
// WRONG: Describes what the code does (obvious from reading)
// Search user by ID
const user = await findUserById(id);

// CORRECT: Explains why this approach was chosen
// Fetch by ID directly to avoid a cache miss on the list query
const user = await findUserById(id);
```

## File Naming

All files must use kebab-case, including component files:

```
// WRONG
UserCard.tsx
userCard.tsx
userCardHelper.ts

// CORRECT
user-card.tsx
user-card-helper.ts
use-auth.ts
api-client.ts
```
