# Contributing to Puppet Master

Thank you for your interest in contributing to Puppet Master! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, constructive, and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/puppetmaster2.git
   cd puppetmaster2/app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Initialize the project:
   ```bash
   npm run init
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-user-profile` - New features
- `fix/login-validation-error` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/auth-module` - Code refactoring
- `test/add-api-tests` - Adding tests

### Creating a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

## Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks** before submitting:
   ```bash
   npm run lint
   npm run test:run
   npm run build
   ```

3. **Create a Pull Request** with:
   - Clear title describing the change
   - Description of what and why
   - Screenshots for UI changes
   - Link to related issues

4. **PR Requirements**:
   - All CI checks must pass
   - At least one approval required
   - No merge conflicts
   - Tests for new functionality

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Export types from `~/types` for shared types

```typescript
// Good
interface UserData {
  id: number
  email: string
  name: string
}

// Avoid
const userData: any = { ... }
```

### Vue Components

- Follow Atomic Design pattern (atoms → molecules → organisms → sections)
- Use `<script setup lang="ts">` syntax
- No scoped styles - use global CSS classes
- Import icons from `~icons/tabler/*`

```vue
<script setup lang="ts">
import IconExample from '~icons/tabler/example'

const props = defineProps<{
  title: string
}>()
</script>

<template>
  <div class="card">
    <h2 class="card-title">{{ title }}</h2>
  </div>
</template>

<!-- NO scoped styles -->
```

### API Routes

- Use `defineEventHandler` from Nitro
- Validate input with Zod schemas
- Return consistent response shapes
- Handle errors properly

```typescript
import { mySchema } from '../../utils/validation'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const result = mySchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      data: result.error.flatten()
    })
  }

  // Business logic
  return { success: true, data: result }
})
```

### CSS

- Use global CSS classes from `app/assets/css/`
- Follow BEM naming convention
- Use OKLCH color space
- Use CSS custom properties for theming

```css
/* Good */
.pricing-card {
  background: var(--color-surface);
}

.pricing-card__title {
  color: var(--color-text);
}

.pricing-card--featured {
  border-color: var(--color-primary);
}
```

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

longer description if needed

Closes #123
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add two-factor authentication

Implement TOTP-based 2FA with backup codes.
Users can enable 2FA from their profile settings.

Closes #42
```

```
fix(api): handle expired session correctly

Return 401 instead of 500 when session is expired.
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests once
npm run test:run

# Run specific test file
npm run test -- path/to/test.spec.ts

# Run with coverage
npm run test:run -- --coverage
```

### Writing Tests

- Place tests in `tests/` directory
- Mirror source structure
- Use factories for test data
- Test both success and error cases

```typescript
import { describe, it, expect } from 'vitest'
import { createTestUser } from '../utils/factories'

describe('UserService', () => {
  it('should create a user', async () => {
    const userData = createTestUser()
    const result = await createUser(userData)

    expect(result.success).toBe(true)
    expect(result.user.email).toBe(userData.email)
  })

  it('should reject duplicate email', async () => {
    const userData = createTestUser()
    await createUser(userData)

    await expect(createUser(userData)).rejects.toThrow('Email already exists')
  })
})
```

### Visual Regression Tests

```bash
# Run Playwright tests
npm run test:e2e:playwright

# Update snapshots
npx playwright test --update-snapshots
```

## Documentation

### Code Comments

- Document complex logic
- Explain "why" not "what"
- Use JSDoc for public APIs

```typescript
/**
 * Validate password against security policy
 *
 * @param password - The password to validate
 * @param policy - Optional custom policy, defaults to DEFAULT_PASSWORD_POLICY
 * @returns Validation result with errors and strength rating
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): PasswordValidationResult {
  // ...
}
```

### Storybook

Add stories for new components:

```typescript
// Component.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import Component from './Component.vue'

const meta: Meta<typeof Component> = {
  title: 'Atoms/Component',
  component: Component,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof Component>

export const Default: Story = {
  args: {
    // default props
  }
}
```

## Questions?

- Open a [GitHub Issue](https://github.com/your-org/puppetmaster2/issues)
- Check existing issues and discussions
- Review the [documentation](./docs/)

Thank you for contributing!
