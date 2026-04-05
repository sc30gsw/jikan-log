---
description: React Native/Expo testing - RNTL role-based queries, no testId, E2E with Detox/Maestro
globs: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx']
alwaysApply: false
---

# React Native/Expo Testing

> This file extends [common/testing.md](../common/testing.md) with Expo-specific content.

## Testing Library

Use **@testing-library/react-native** for component and hook tests.

## Query by Role (REQUIRED)

Use `role` to locate interactive elements. Never use `testId` or CSS selectors.

```typescript
// CORRECT: role-based queries
const submitButton = screen.getByRole('button', { name: 'Submit' });
const deleteLink = screen.getByRole('link', { name: 'Delete' });

// WRONG: testId or class-based queries
const submitButton = screen.getByTestId('submit-button');
```

## Assertion Elements

Assert on what the user sees — text or role, not implementation details.

```typescript
// CORRECT
expect(screen.getByRole('heading', { name: 'User List' })).toBeOnTheScreen();
expect(screen.getByText('Registration complete')).toBeOnTheScreen();
expect(screen.getByRole('alert')).toHaveTextContent('An error occurred');

// WRONG
expect(screen.getByTestId('success-message')).toBeOnTheScreen();
```

## No `testId`

Do not add `testID` props. Instead, make components accessible with proper roles and labels.

```tsx
// WRONG
<Pressable testID="submit-btn">Submit</Pressable>

// CORRECT: accessible name makes testID unnecessary
<Pressable accessibilityRole="button" accessibilityLabel="Submit">
  Submit
</Pressable>
```

## E2E Testing

Use **Maestro** or **Detox** for E2E tests on Expo projects. Do not use Playwright (web-only).
