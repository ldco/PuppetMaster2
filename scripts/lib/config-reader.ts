/**
 * Puppet Master Config Reader
 *
 * Reads and parses the puppet-master.config.ts file.
 * Used by: setup wizard, CLI prompts, headless scripts, /pm-status command
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PmMode = 'unconfigured' | 'build' | 'develop'
export type ProjectType = 'website' | 'app'

export interface PmConfigSummary {
  /** Setup state */
  pmMode: PmMode
  /** Project type (only relevant in build mode) */
  projectType: ProjectType | null
  /** Admin panel enabled */
  adminEnabled: boolean
  /** Active locales */
  locales: string[]
  /** Default locale */
  defaultLocale: string
  /** Enabled modules */
  enabledModules: string[]
  /** Feature flags */
  features: {
    multiLangs: boolean
    doubleTheme: boolean
    onepager: boolean
    pwa: boolean
  }
  /** Has import folder with content */
  hasBrownfieldContent: boolean
  /** Database exists */
  databaseExists: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG PATH
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG_FILENAME = 'puppet-master.config.ts'

/**
 * Get the path to the config file
 */
export function getConfigPath(appDir?: string): string {
  const dir = appDir || process.cwd()
  return resolve(dir, 'app', CONFIG_FILENAME)
}

/**
 * Check if config file exists
 */
export function configExists(appDir?: string): boolean {
  return existsSync(getConfigPath(appDir))
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGEX PATTERNS FOR PARSING
// ═══════════════════════════════════════════════════════════════════════════════

const PATTERNS = {
  // pmMode: 'unconfigured' | 'build' | 'develop'
  pmMode: /pmMode:\s*['"](\w+)['"]/,

  // entities.website: true/false
  entityWebsite: /website:\s*(true|false)/,
  entityApp: /app:\s*(true|false)/,

  // admin.enabled: true/false
  adminEnabled: /admin:\s*\{[\s\S]*?enabled:\s*(true|false)/,

  // locales array
  locales: /locales:\s*\[([\s\S]*?)\]/,
  localeCode: /code:\s*['"](\w+)['"]/g,

  // defaultLocale
  defaultLocale: /defaultLocale:\s*['"](\w+)['"]/,

  // modules - each module with enabled: true/false
  moduleEnabled: /(\w+):\s*\{[^}]*enabled:\s*(true|false)/g,

  // features
  featureMultiLangs: /multiLangs:\s*(true|false)/,
  featureDoubleTheme: /doubleTheme:\s*(true|false)/,
  featureOnepager: /onepager:\s*(true|false)/,
  featurePwa: /pwa:\s*(true|false)/
}

// ═══════════════════════════════════════════════════════════════════════════════
// READER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Read raw config file content
 */
export function readConfigRaw(appDir?: string): string {
  const configPath = getConfigPath(appDir)
  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`)
  }
  return readFileSync(configPath, 'utf-8')
}

/**
 * Extract pmMode from config
 */
export function readPmMode(appDir?: string): PmMode {
  const content = readConfigRaw(appDir)
  const match = content.match(PATTERNS.pmMode)
  if (match && ['unconfigured', 'build', 'develop'].includes(match[1])) {
    return match[1] as PmMode
  }
  // If pmMode not found, check if this is an old config (no pmMode field)
  // Old configs without pmMode are considered 'unconfigured'
  return 'unconfigured'
}

/**
 * Extract project type from entities config
 */
export function readProjectType(appDir?: string): ProjectType | null {
  const content = readConfigRaw(appDir)
  const websiteMatch = content.match(PATTERNS.entityWebsite)
  const appMatch = content.match(PATTERNS.entityApp)

  const hasWebsite = websiteMatch?.[1] === 'true'
  const hasApp = appMatch?.[1] === 'true'

  if (hasWebsite && !hasApp) return 'website'
  if (hasApp && !hasWebsite) return 'app'
  if (hasWebsite && hasApp) return 'website' // Website takes precedence
  return null
}

/**
 * Extract admin enabled status
 */
export function readAdminEnabled(appDir?: string): boolean {
  const content = readConfigRaw(appDir)
  const match = content.match(PATTERNS.adminEnabled)
  return match?.[1] === 'true'
}

/**
 * Extract locale codes
 */
export function readLocales(appDir?: string): string[] {
  const content = readConfigRaw(appDir)
  const localesMatch = content.match(PATTERNS.locales)
  if (!localesMatch) return ['en']

  const localesBlock = localesMatch[1]
  const codes: string[] = []
  let match
  while ((match = PATTERNS.localeCode.exec(localesBlock)) !== null) {
    codes.push(match[1])
  }
  return codes.length > 0 ? codes : ['en']
}

/**
 * Extract default locale
 */
export function readDefaultLocale(appDir?: string): string {
  const content = readConfigRaw(appDir)
  const match = content.match(PATTERNS.defaultLocale)
  return match?.[1] || 'en'
}

/**
 * Extract enabled modules
 */
export function readEnabledModules(appDir?: string): string[] {
  const content = readConfigRaw(appDir)

  // Find the modules section
  const modulesStart = content.indexOf('modules:')
  if (modulesStart === -1) return []

  // Find the end of modules section (next major section or end)
  const modulesSection = content.slice(modulesStart, modulesStart + 3000)

  const enabled: string[] = []
  const modulePattern = /(\w+):\s*\{[^{}]*enabled:\s*(true)/g
  let match
  while ((match = modulePattern.exec(modulesSection)) !== null) {
    // Skip if it's a nested config property
    if (!['config', 'system', 'websiteModules', 'appModules'].includes(match[1])) {
      enabled.push(match[1])
    }
  }
  return enabled
}

/**
 * Extract feature flags
 */
export function readFeatures(appDir?: string): PmConfigSummary['features'] {
  const content = readConfigRaw(appDir)
  return {
    multiLangs: content.match(PATTERNS.featureMultiLangs)?.[1] === 'true',
    doubleTheme: content.match(PATTERNS.featureDoubleTheme)?.[1] === 'true',
    onepager: content.match(PATTERNS.featureOnepager)?.[1] === 'true',
    pwa: content.match(PATTERNS.featurePwa)?.[1] === 'true'
  }
}

/**
 * Check if import folder has content (brownfield detection)
 */
export function hasBrownfieldContent(appDir?: string): boolean {
  const dir = appDir || process.cwd()
  const importPath = resolve(dir, 'import')
  if (!existsSync(importPath)) return false

  // Check for PROJECT.md or any content files
  const projectMd = resolve(importPath, 'PROJECT.md')
  if (existsSync(projectMd)) {
    const content = readFileSync(projectMd, 'utf-8')
    // Check if it has been filled out (not just template)
    return content.includes('## Project Overview') && !content.includes('[Your project name]')
  }

  return false
}

/**
 * Check if database exists
 */
export function databaseExists(appDir?: string): boolean {
  const dir = appDir || process.cwd()
  return existsSync(resolve(dir, 'data', 'sqlite.db'))
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN READER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Read full config summary
 */
export function readConfigSummary(appDir?: string): PmConfigSummary {
  return {
    pmMode: readPmMode(appDir),
    projectType: readProjectType(appDir),
    adminEnabled: readAdminEnabled(appDir),
    locales: readLocales(appDir),
    defaultLocale: readDefaultLocale(appDir),
    enabledModules: readEnabledModules(appDir),
    features: readFeatures(appDir),
    hasBrownfieldContent: hasBrownfieldContent(appDir),
    databaseExists: databaseExists(appDir)
  }
}

/**
 * Get human-readable status for display
 */
export function getStatusDisplay(appDir?: string): string {
  const summary = readConfigSummary(appDir)

  const lines: string[] = []

  // Mode
  const modeLabels: Record<PmMode, string> = {
    unconfigured: 'Unconfigured (needs setup)',
    build: 'BUILD mode (client project)',
    develop: 'DEVELOP mode (framework development)'
  }
  lines.push(`Mode: ${modeLabels[summary.pmMode]}`)

  // Project type (if build mode)
  if (summary.pmMode === 'build' && summary.projectType) {
    lines.push(`Project Type: ${summary.projectType === 'website' ? 'Website' : 'App'}`)
  }

  // Admin
  lines.push(`Admin Panel: ${summary.adminEnabled ? 'Enabled' : 'Disabled'}`)

  // Locales
  lines.push(`Locales: ${summary.locales.join(', ')} (default: ${summary.defaultLocale})`)

  // Modules
  if (summary.enabledModules.length > 0) {
    lines.push(`Modules: ${summary.enabledModules.join(', ')}`)
  } else {
    lines.push(`Modules: None enabled`)
  }

  // Features
  const activeFeatures = Object.entries(summary.features)
    .filter(([, v]) => v)
    .map(([k]) => k)
  if (activeFeatures.length > 0) {
    lines.push(`Features: ${activeFeatures.join(', ')}`)
  }

  // Database
  lines.push(`Database: ${summary.databaseExists ? 'Exists' : 'Not created'}`)

  // Brownfield
  if (summary.hasBrownfieldContent) {
    lines.push(`Import: Brownfield content detected`)
  }

  return lines.join('\n')
}
