/**
 * Get Setup Config API
 *
 * GET /api/setup/config
 * Returns: Current configuration summary for wizard
 *
 * No auth required - setup wizard is accessible before any users exist
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

interface ConfigSummary {
  pmMode: 'unconfigured' | 'build' | 'develop'
  projectType: 'website' | 'app' | null
  adminEnabled: boolean
  locales: Array<{ code: string; iso: string; name: string }>
  defaultLocale: string
  enabledModules: string[]
  features: {
    multiLangs: boolean
    doubleTheme: boolean
    onepager: boolean
    pwa: boolean
  }
  hasBrownfieldContent: boolean
  importFolderFiles: string[]
  databaseExists: boolean
}

export default defineEventHandler(async (event): Promise<ConfigSummary> => {
  // Path to config file (relative to project root)
  const configPath = resolve(process.cwd(), 'app', 'puppet-master.config.ts')

  if (!existsSync(configPath)) {
    throw createError({
      statusCode: 500,
      message: 'Config file not found'
    })
  }

  const content = readFileSync(configPath, 'utf-8')

  // Parse pmMode
  const pmModeMatch = content.match(/pmMode:\s*['"](\w+)['"]/)
  const pmMode = (pmModeMatch?.[1] as ConfigSummary['pmMode']) || 'unconfigured'

  // Parse entities
  const websiteMatch = content.match(/website:\s*(true|false)/)
  const appMatch = content.match(/app:\s*(true|false)/)
  const hasWebsite = websiteMatch?.[1] === 'true'
  const hasApp = appMatch?.[1] === 'true'

  let projectType: ConfigSummary['projectType'] = null
  if (hasWebsite && !hasApp) projectType = 'website'
  else if (hasApp && !hasWebsite) projectType = 'app'
  else if (hasWebsite) projectType = 'website'

  // Parse admin.enabled
  const adminMatch = content.match(/admin:\s*\{[\s\S]*?enabled:\s*(true|false)/)
  const adminEnabled = adminMatch?.[1] === 'true'

  // Parse locales
  const localesMatch = content.match(/locales:\s*\[([\s\S]*?)\]/)
  const locales: ConfigSummary['locales'] = []
  if (localesMatch) {
    const localePattern = /\{\s*code:\s*['"](\w+)['"]\s*,\s*iso:\s*['"]([^'"]+)['"]\s*,\s*name:\s*['"]([^'"]+)['"]\s*\}/g
    let match
    while ((match = localePattern.exec(localesMatch[1])) !== null) {
      locales.push({ code: match[1], iso: match[2], name: match[3] })
    }
  }
  if (locales.length === 0) {
    locales.push({ code: 'en', iso: 'en-US', name: 'English' })
  }

  // Parse defaultLocale
  const defaultLocaleMatch = content.match(/defaultLocale:\s*['"](\w+)['"]/)
  const defaultLocale = defaultLocaleMatch?.[1] || 'en'

  // Parse enabled modules
  const modulesStart = content.indexOf('modules:')
  const enabledModules: string[] = []
  if (modulesStart !== -1) {
    const modulesSection = content.slice(modulesStart, modulesStart + 3000)
    const modulePattern = /(\w+):\s*\{[^{}]*enabled:\s*(true)/g
    let match
    while ((match = modulePattern.exec(modulesSection)) !== null) {
      if (!['config', 'system', 'websiteModules', 'appModules'].includes(match[1])) {
        enabledModules.push(match[1])
      }
    }
  }

  // Parse features
  const features = {
    multiLangs: /multiLangs:\s*true/.test(content),
    doubleTheme: /doubleTheme:\s*true/.test(content),
    onepager: /onepager:\s*true/.test(content),
    pwa: /pwa:\s*true/.test(content)
  }

  // Check for brownfield content
  const importPath = resolve(process.cwd(), 'import')
  let hasBrownfieldContent = false
  const importFolderFiles: string[] = []

  if (existsSync(importPath)) {
    // Scan import folder for files (non-recursive top-level)
    try {
      const entries = readdirSync(importPath)
      for (const entry of entries) {
        const entryPath = join(importPath, entry)
        const stat = statSync(entryPath)
        if (stat.isDirectory()) {
          importFolderFiles.push(`${entry}/`)
        } else if (!entry.startsWith('.')) {
          importFolderFiles.push(entry)
        }
      }
    } catch {
      // Ignore read errors
    }

    // Check for PROJECT.md with filled content
    const projectMd = resolve(importPath, 'PROJECT.md')
    if (existsSync(projectMd)) {
      const projectContent = readFileSync(projectMd, 'utf-8')
      hasBrownfieldContent = projectContent.includes('## Project Overview') && !projectContent.includes('[Your project name]')
    }

    // Also consider folder with any non-template files as brownfield
    if (!hasBrownfieldContent && importFolderFiles.length > 0) {
      // If there are folders or non-template files besides PROJECT.md
      const hasRealContent = importFolderFiles.some(f =>
        f !== 'PROJECT.md' && !f.startsWith('.')
      )
      if (hasRealContent) {
        hasBrownfieldContent = true
      }
    }
  }

  // Check if database exists
  const dbPath = resolve(process.cwd(), 'data', 'sqlite.db')
  const databaseExists = existsSync(dbPath)

  return {
    pmMode,
    projectType,
    adminEnabled,
    locales,
    defaultLocale,
    enabledModules,
    features,
    hasBrownfieldContent,
    importFolderFiles,
    databaseExists
  }
})
