/**
 * Save Setup Config API
 *
 * POST /api/setup/config
 * Body: SetupConfig
 * Returns: { success: true }
 *
 * Writes configuration to puppet-master.config.ts
 * No auth required - setup wizard runs before users exist
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { z } from 'zod'

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
    pwa: z.boolean().optional()
  }).optional()
})

type SetupConfig = z.infer<typeof setupConfigSchema>

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = setupConfigSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message || 'Invalid configuration'
    })
  }

  const config = result.data
  const configPath = resolve(process.cwd(), 'app', 'puppet-master.config.ts')

  if (!existsSync(configPath)) {
    throw createError({
      statusCode: 500,
      message: 'Config file not found'
    })
  }

  let content = readFileSync(configPath, 'utf-8')

  // Helper: Replace boolean value
  const replaceBoolean = (str: string, key: string, value: boolean): string => {
    const pattern = new RegExp(`(${key}:\\s*)(true|false)`, 'g')
    return str.replace(pattern, `$1${value}`)
  }

  // Helper: Replace string value
  const replaceString = (str: string, key: string, value: string): string => {
    const pattern = new RegExp(`(${key}:\\s*)['"][^'"]*['"]`, 'g')
    return str.replace(pattern, `$1'${value}'`)
  }

  // 1. Update pmMode
  if (/pmMode:/.test(content)) {
    content = content.replace(
      /pmMode:\s*['"]?\w+['"]?\s*as\s*['"][^'"]*['"]\s*\|\s*['"][^'"]*['"]\s*\|\s*['"][^'"]*['"]/,
      `pmMode: '${config.pmMode}' as 'unconfigured' | 'build' | 'develop'`
    )
  } else {
    // Add pmMode field if missing
    const configStart = content.indexOf('const config = {')
    if (configStart !== -1) {
      const insertPoint = content.indexOf('{', configStart) + 1
      content = content.slice(0, insertPoint) + `
  // PM MODE
  pmMode: '${config.pmMode}' as 'unconfigured' | 'build' | 'develop',
` + content.slice(insertPoint)
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
    const allModules = [
      'portfolio', 'pricing', 'contact', 'blog', 'team',
      'testimonials', 'features', 'clients', 'faq'
    ]
    for (const moduleId of allModules) {
      const enabled = config.modules.includes(moduleId)
      // Match: moduleId: { ... enabled: true/false
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
  }

  // Write updated config
  writeFileSync(configPath, content, 'utf-8')

  // Run db:push to create/update database schema
  try {
    const { execSync } = await import('child_process')
    execSync('npm run db:push', {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '0' },
      input: 'y\n' // Auto-confirm drizzle prompts
    })
  } catch (e: any) {
    // Log but don't fail - database might already be set up
    console.warn('db:push warning:', e.message)
  }

  return { success: true }
})
