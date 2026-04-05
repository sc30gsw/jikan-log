---
description: Feature-based project structure - directory layout, import path alias, feature inter-dependencies
globs: ['**/*.ts', '**/*.tsx']
alwaysApply: true
---

# Project Structure

Follows [Bulletproof React](https://github.com/alan2207/bulletproof-react) feature-based architecture.

## Directory Layout

```
src/
├── components/     # Shared UI components used across multiple features
├── features/       # Feature modules (main business logic)
│   └── [feature]/
│       ├── api/          # API layer (mutations, queries)
│       ├── components/   # Feature-specific components
│       ├── hooks/        # Feature-specific custom hooks
│       ├── schemas/      # Validation schemas
│       ├── stores/       # State management
│       ├── types/        # Type definitions
│       ├── mocks/        # Test mock data
│       └── index.ts      # Public API (barrel file)
├── hooks/          # Shared custom hooks
├── lib/            # Library configuration and initialization
├── app/            # Expo Router screens (routing only, minimal logic)
├── stores/         # Global state (atoms)
├── types/          # Shared type definitions
└── utils/          # Utility functions
```

## Import Path: `~` Alias (REQUIRED)

**Relative paths are forbidden.** Always use the `~` alias, even within the same directory.

```typescript
// CORRECT
import { useUsers } from '~/features/users/hooks/use-users';
import type { User } from '~/features/users/types/user';
import { Button } from '~/components/ui/button';

// WRONG: relative paths
import { useUsers } from '../../../features/users/hooks/use-users';
import { Button } from '../../components/ui/button';
import { helper } from './helper'; // even same directory
```

> Using `~` everywhere means import paths never need updating when files move.

## Import Order

Group imports in this order, with a blank line between each group:

```typescript
// 1. External libraries (React, third-party)
import { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Internal modules (~ alias)
import { useUsers } from '~/features/users/hooks/use-users';
import { formatDate } from '~/utils/date';

// 3. Type imports
import type { User, UserRole } from '~/features/users/types/user';
```

## Feature Inter-Dependencies

**Direct imports between features are forbidden.** Extract shared code to a parent directory.

```typescript
// WRONG: feature importing directly from another feature
// src/features/orders/components/order-form.tsx
import { UserSelect } from '~/features/users/components/user-select';

// CORRECT: extract to shared components
// src/components/user-select.tsx
import { UserSelect } from '~/components/user-select';
```

## Expo Router Screens

Expo Router requires default exports for screen files (`app/**/*.tsx`). This is the only exception to the named-export rule.

```typescript
// app/(tabs)/index.tsx — default export required by Expo Router
export default function HomeScreen() {
  return <View />
}
```
