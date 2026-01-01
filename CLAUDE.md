# Puppet Master

## Vision
Config-driven studio toolkit for building client websites - fast, secure, production-ready.

## Stack
- Frontend: Nuxt3 (Vue 3.5, TypeScript) | Entry: `app/`, `app/pages/`
- Backend: Nitro (H3) | Entry: `server/api/`
- Database: SQLite + Drizzle ORM | Schema: `server/database/schema.ts`
- Styling: Pure CSS (OKLCH, CSS Layers) | Entry: `app/assets/css/main.css`

## Critical Rules
- **Imports**: Use `~/` for app directory, `~~/` for root, `~icons/` for Tabler icons
- **Components**: Atomic Design pattern (atoms → molecules → organisms → sections)
- **API Routes**: Use `defineEventHandler`, validate with Zod, parse with `readBody`
- **Styles**: Global CSS classes only, NO scoped styles in components
- **Types**: Database entities & API responses → SHARED in `~/types`. Local types ONLY for composable/plugin internals
- **Config**: All build-time config in `app/puppet-master.config.ts`
- **Git**: Ask before commit/push

## Patterns

### Vue Component
```vue
<script setup lang="ts">
import IconExample from '~icons/tabler/example'
const { t } = useI18n()
const colorMode = useColorMode()
</script>

<template>
  <!-- Use global CSS classes -->
  <div class="card">
    <IconExample class="icon" />
  </div>
</template>
<!-- NO scoped styles -->
```

### API Route
```typescript
import { useDatabase, schema } from '../../database/client'
import { mySchema } from '../../utils/validation'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const result = mySchema.safeParse(body)

  if (!result.success) {
    throw createError({ statusCode: 400, data: result.error.flatten() })
  }

  const db = useDatabase()
  // ... business logic
  return { success: true, data: result }
})
```

## Commands
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run test       # Run tests (Vitest)
npm run lint       # ESLint
npm run db:push    # Apply schema
npm run db:seed    # Seed data
npm run db:studio  # Drizzle Studio
```

## Key Files
- `app/puppet-master.config.ts` - All feature toggles, colors, locales
- `server/database/schema.ts` - Database schema (Drizzle)
- `server/utils/validation.ts` - Zod schemas
- `app/types/` - Shared TypeScript types (import from `~/types`)
- `app/assets/css/` - CSS system (50+ files)
- `docs/` - Full documentation

## Context
Read: `.claude-data/context.md`
Config: `.claude/config.json`
