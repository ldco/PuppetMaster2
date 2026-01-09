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

## Puppet Master Architect Role

When working on PM projects, Claude acts as **Puppet Master Architect** — a specialized AI co-pilot that:
- Understands the entire PM framework deeply
- Guides users through Greenfield (new) and Brownfield (import) workflows
- Uses `/pm` commands for PM-specific operations
- Collaborates with expert personas via `/as` command

See: `docs/PM-CLAUDE-SYSTEM.md` for full documentation.

## PM Commands (Claude)

Project-specific commands in `.claude/commands/`:

| Command | Purpose |
|---------|---------|
| `/pm init` | Guided setup wizard — asks about mode, features, modules, locales |
| `/pm migrate` | Import existing project — analyzes, maps, creates migration plan |
| `/pm status` | Show current config — mode, modules, features, database state |
| `/pm start` | Initialize database + start dev server |
| `/pm contribute` | Export fix/feature as contribution doc (for client projects) |
| `/pm apply` | Apply contribution doc to PM framework |

### Workflows

**Greenfield (New Project):**
```
git clone puppet-master my-project
cd my-project
/init                    # General Claude setup
/pm init                 # PM setup wizard
/pm start                # Database + dev server
```

**Brownfield (Import Existing):**
```
git clone puppet-master my-project
cd my-project
cp -r ~/old-project ./import/
/init                    # General Claude setup
/pm migrate              # Analyze + map + plan
/pm start                # Database + dev server
```

**Contributing Back to PM** (from client project):
```
# In client project - after fixing/adding something to PM base
/pm contribute           # Generates .pm-contribution.md
cp .pm-contribution.md ~/puppet-master/

# In PM framework repo
/pm apply                # Reads and implements the contribution
```

### Migration System

`/pm migrate` decomposes projects into 7 domains and maps EVERY item:

1. **FRONTEND** — Pages, Components, Layouts, Composables
2. **BACKEND** — API routes, Middleware, Server utilities
3. **DATABASE** — Schema, Models, Migrations, Seed data
4. **STYLES** — Colors, Typography, Spacing, Component styles
5. **AUTH** — Users, Sessions, Roles, Protected routes
6. **I18N** — Locales, Translations, RTL support
7. **ASSETS** — Images, Fonts, Icons, Documents

Each item gets an action: `PM_EXISTS`, `PM_NATIVE`, `CREATE`, `REWRITE`, `PROXY`, `KEEP`, `COPY`, `CONVERT`, `MERGE`, `SKIP`

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

## NPM Commands
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
- `.claude/commands/` - PM-specific Claude commands

## Context
- Session context: `.claude-data/context.md`
- Project config: `.claude/config.json`
- PM Claude docs: `docs/PM-CLAUDE-SYSTEM.md`
