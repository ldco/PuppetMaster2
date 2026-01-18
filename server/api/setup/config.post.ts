/**
 * Save Setup Config API
 *
 * POST /api/setup/config
 * Body: SetupConfig
 * Returns: { success: true, databaseStatus: 'created' | 'exists' | 'error' }
 *
 * Writes configuration to puppet-master.config.ts.
 * No auth required - setup wizard runs before users exist.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS (single source of truth for modules)
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_MODULES = [
  'blog', 'portfolio', 'team', 'testimonials', 'faq',
  'pricing', 'clients', 'features', 'contact'
] as const

type PmMode = 'unconfigured' | 'build' | 'develop'
type ProjectType = 'website' | 'app'

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG HELPERS (inline for server compatibility)
// ═══════════════════════════════════════════════════════════════════════════════

function getConfigPath(appDir: string): string {
  return resolve(appDir, 'puppet-master.config.ts')
}

function readConfigRaw(appDir: string): string {
  const configPath = getConfigPath(appDir)
  return readFileSync(configPath, 'utf-8')
}

function replaceBoolean(content: string, key: string, value: boolean): string {
  const pattern = new RegExp(`(${key}:\\s*)(true|false)`, 'g')
  return content.replace(pattern, `$1${value}`)
}

function replaceString(content: string, key: string, value: string): string {
  const pattern = new RegExp(`(${key}:\\s*)['"][^'"]*['"]`, 'g')
  return content.replace(pattern, `$1'${value}'`)
}

function createBackup(appDir: string): string | undefined {
  try {
    const configPath = getConfigPath(appDir)
    if (!existsSync(configPath)) return undefined

    const dir = dirname(configPath)
    const timestamp = Date.now()
    const backupPath = resolve(dir, `puppet-master.config.ts.backup.${timestamp}`)

    const content = readFileSync(configPath, 'utf-8')
    writeFileSync(backupPath, content, 'utf-8')

    // Clean up old backups (keep only 3)
    const backups = readdirSync(dir)
      .filter(f => f.startsWith('puppet-master.config.ts.backup.'))
      .map(f => ({ path: resolve(dir, f), ts: parseInt(f.split('.').pop() || '0', 10) }))
      .sort((a, b) => b.ts - a.ts)

    for (const backup of backups.slice(3)) {
      try { unlinkSync(backup.path) } catch {}
    }

    return backupPath
  } catch {
    return undefined
  }
}

function rollbackToBackup(appDir: string): boolean {
  try {
    const configPath = getConfigPath(appDir)
    const dir = dirname(configPath)

    const backups = readdirSync(dir)
      .filter(f => f.startsWith('puppet-master.config.ts.backup.'))
      .map(f => ({ path: resolve(dir, f), ts: parseInt(f.split('.').pop() || '0', 10) }))
      .sort((a, b) => b.ts - a.ts)

    if (backups.length === 0) return false

    const backupContent = readFileSync(backups[0].path, 'utf-8')
    writeFileSync(configPath, backupContent, 'utf-8')
    return true
  } catch {
    return false
  }
}

function readPmMode(appDir: string): PmMode {
  try {
    const content = readConfigRaw(appDir)
    // Match pmMode value regardless of type annotation style
    const match = content.match(/pmMode:\s*['"](\w+)['"]/)
    if (match && ['unconfigured', 'build', 'develop'].includes(match[1])) {
      return match[1] as PmMode
    }
    return 'unconfigured'
  } catch {
    return 'unconfigured'
  }
}

function databaseExists(appDir: string): boolean {
  return existsSync(resolve(appDir, '..', 'data', 'sqlite.db'))
}

interface SetupConfig {
  pmMode: PmMode
  projectType?: ProjectType
  adminEnabled?: boolean
  locales?: Array<{ code: string; iso: string; name: string }>
  defaultLocale?: string
  modules?: string[]
  features?: {
    multiLangs?: boolean
    doubleTheme?: boolean
    onepager?: boolean
    pwa?: boolean
    twoFactorAuth?: boolean
  }
}

function applyConfig(appDir: string, config: SetupConfig): void {
  const configPath = getConfigPath(appDir)
  let content = readConfigRaw(appDir)

  // 1. Update pmMode
  // Handle both formats:
  //   - pmMode: 'value' as const
  //   - pmMode: 'value' as 'unconfigured' | 'build' | 'develop'
  if (/pmMode:/.test(content)) {
    // Match pmMode with either 'as const' or union type annotation
    const pmModePattern = /pmMode:\s*['"][^'"]+['"]\s*as\s*(?:const|'[^']+'\s*\|\s*'[^']+'\s*\|\s*'[^']+')/
    if (pmModePattern.test(content)) {
      content = content.replace(
        pmModePattern,
        `pmMode: '${config.pmMode}' as 'unconfigured' | 'build' | 'develop'`
      )
    }
  }

  // 2. Update project type (entities)
  if (config.projectType) {
    content = replaceBoolean(content, 'website', config.projectType === 'website')
    content = replaceBoolean(content, 'app', config.projectType === 'app')
  }

  // 3. Update admin.enabled
  if (config.adminEnabled !== undefined) {
    const adminPattern = /(admin:\s*\{[\s\S]*?)(enabled:\s*)(true|false)/
    content = content.replace(adminPattern, `$1$2${config.adminEnabled}`)
  }

  // 4. Update locales
  if (config.locales && config.locales.length > 0) {
    const localesStr = config.locales
      .map(l => `    { code: '${l.code}', iso: '${l.iso}', name: '${l.name}' }`)
      .join(',\n')
    const localesPattern = /locales:\s*\[[\s\S]*?\]/
    content = content.replace(localesPattern, `locales: [\n${localesStr}\n  ]`)
  }

  // 5. Update defaultLocale
  if (config.defaultLocale) {
    content = replaceString(content, 'defaultLocale', config.defaultLocale)
  }

  // 6. Update modules
  if (config.modules) {
    for (const moduleId of ALL_MODULES) {
      const enabled = config.modules.includes(moduleId)
      const modulePattern = new RegExp(`(${moduleId}:\\s*\\{[^}]*)(enabled:\\s*)(true|false)`, 's')
      content = content.replace(modulePattern, `$1$2${enabled}`)
    }
  }

  // 7. Update features
  if (config.features) {
    if (config.features.multiLangs !== undefined) {
      content = replaceBoolean(content, 'multiLangs', config.features.multiLangs)
    }
    if (config.features.doubleTheme !== undefined) {
      content = replaceBoolean(content, 'doubleTheme', config.features.doubleTheme)
    }
    if (config.features.onepager !== undefined) {
      content = replaceBoolean(content, 'onepager', config.features.onepager)
    }
    if (config.features.pwa !== undefined) {
      content = replaceBoolean(content, 'pwa', config.features.pwa)
    }
    if (config.features.twoFactorAuth !== undefined) {
      content = replaceBoolean(content, 'twoFactorAuth', config.features.twoFactorAuth)
    }
  }

  writeFileSync(configPath, content, 'utf-8')
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA & HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

const setupConfigSchema = z.object({
  pmMode: z.enum(['unconfigured', 'build', 'develop']),
  projectType: z.enum(['website', 'app']).optional(),
  adminEnabled: z.boolean().optional(),
  locales: z.array(z.object({
    code: z.string(),
    iso: z.string(),
    name: z.string()
  })).optional(),
  defaultLocale: z.string().optional(),
  modules: z.array(z.string()).optional(),
  features: z.object({
    multiLangs: z.boolean().optional(),
    doubleTheme: z.boolean().optional(),
    onepager: z.boolean().optional(),
    pwa: z.boolean().optional(),
    twoFactorAuth: z.boolean().optional()
  }).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = setupConfigSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PM_CONFIG_001: Invalid configuration',
      message: result.error.issues[0]?.message || 'Invalid configuration'
    })
  }

  const config = result.data
  const appDir = resolve(process.cwd(), 'app')
  const configPath = getConfigPath(appDir)

  if (!existsSync(configPath)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'PM_CONFIG_002: Config file not found',
      message: 'Config file not found. Please ensure puppet-master.config.ts exists.'
    })
  }

  // Create backup before modification
  const backupPath = createBackup(appDir)

  // Filter to valid modules only
  const validModules = config.modules
    ? config.modules.filter(m => (ALL_MODULES as readonly string[]).includes(m))
    : undefined

  try {
    // Apply configuration
    applyConfig(appDir, {
      pmMode: config.pmMode as PmMode,
      projectType: config.projectType as ProjectType | undefined,
      adminEnabled: config.adminEnabled,
      locales: config.locales,
      defaultLocale: config.defaultLocale,
      modules: validModules,
      features: config.features
    })

    // Validate the write succeeded
    const actualMode = readPmMode(appDir)
    if (actualMode !== config.pmMode) {
      // Try to rollback
      if (backupPath) {
        rollbackToBackup(appDir)
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'PM_CONFIG_003: Config validation failed',
        message: 'Config was written but validation failed. Rolled back to previous state.'
      })
    }
  } catch (e: any) {
    // If not already a create error, wrap it
    if (!e.statusCode) {
      throw createError({
        statusCode: 500,
        statusMessage: 'PM_CONFIG_004: Config write failed',
        message: e.message || 'Failed to write configuration'
      })
    }
    throw e
  }

  // Run db:push to create/update database schema
  let databaseStatus: 'created' | 'exists' | 'error' = 'exists'
  const dbExisted = databaseExists(appDir)

  try {
    const { execSync } = await import('child_process')
    execSync('npm run db:push', {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '0' },
      input: 'y\n' // Auto-confirm drizzle prompts
    })
    databaseStatus = dbExisted ? 'exists' : 'created'
  } catch (e: any) {
    // Log the actual error for debugging
    console.error('db:push error:', e.message)
    databaseStatus = 'error'
  }

  return {
    success: true,
    databaseStatus,
    backupPath
  }
})
