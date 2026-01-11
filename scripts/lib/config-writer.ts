/**
 * Puppet Master Config Writer
 *
 * Modifies specific values in the puppet-master.config.ts file.
 * Used by: setup wizard API, CLI prompts, headless scripts
 *
 * Strategy: Regex-based replacement to preserve formatting and comments.
 * Falls back to full rewrite only when adding new fields.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import type { PmMode, ProjectType } from './config-reader'
import { getConfigPath, readConfigRaw } from './config-reader'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SetupConfig {
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
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPLACEMENT PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Replace a simple value in the config
 * Pattern: key: value or key: 'value'
 */
function replaceValue(content: string, pattern: RegExp, newValue: string): string {
  if (pattern.test(content)) {
    return content.replace(pattern, newValue)
  }
  return content
}

/**
 * Replace boolean value
 */
function replaceBoolean(content: string, key: string, value: boolean): string {
  // Match: key: true or key: false (with optional spaces)
  const pattern = new RegExp(`(${key}:\\s*)(true|false)`, 'g')
  return content.replace(pattern, `$1${value}`)
}

/**
 * Replace string value
 */
function replaceString(content: string, key: string, value: string): string {
  // Match: key: 'value' or key: "value"
  const pattern = new RegExp(`(${key}:\\s*)['"]\\w+['"]`, 'g')
  return content.replace(pattern, `$1'${value}'`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD WRITERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Add pmMode field to config if missing
 */
function ensurePmModeField(content: string): string {
  // Check if pmMode already exists
  if (/pmMode:/.test(content)) {
    return content
  }

  // Add pmMode after the opening of const config = {
  const configStart = content.indexOf('const config = {')
  if (configStart === -1) {
    throw new Error('Could not find "const config = {" in config file')
  }

  const insertPoint = content.indexOf('{', configStart) + 1
  const before = content.slice(0, insertPoint)
  const after = content.slice(insertPoint)

  return `${before}
  // ═══════════════════════════════════════════════════════════════════════════
  // PM MODE - Setup state (unconfigured, build, develop)
  // ═══════════════════════════════════════════════════════════════════════════
  pmMode: 'unconfigured' as const,

${after}`
}

/**
 * Set pmMode value
 */
export function writePmMode(appDir: string | undefined, mode: PmMode): void {
  let content = readConfigRaw(appDir)

  // Ensure field exists
  content = ensurePmModeField(content)

  // Replace value
  content = content.replace(
    /pmMode:\s*['"]?\w+['"]?\s*as const/,
    `pmMode: '${mode}' as const`
  )

  const configPath = getConfigPath(appDir)
  writeFileSync(configPath, content, 'utf-8')
}

/**
 * Set project type (entities.website/app)
 */
export function writeProjectType(appDir: string | undefined, type: ProjectType): void {
  let content = readConfigRaw(appDir)

  if (type === 'website') {
    content = replaceBoolean(content, 'website', true)
    content = replaceBoolean(content, 'app', false)
  } else {
    content = replaceBoolean(content, 'website', false)
    content = replaceBoolean(content, 'app', true)
  }

  const configPath = getConfigPath(appDir)
  writeFileSync(configPath, content, 'utf-8')
}

/**
 * Set admin enabled
 */
export function writeAdminEnabled(appDir: string | undefined, enabled: boolean): void {
  let content = readConfigRaw(appDir)

  // Find admin section and replace enabled
  // Match: admin: { ... enabled: true/false
  const adminPattern = /(admin:\s*\{[\s\S]*?)(enabled:\s*)(true|false)/
  content = content.replace(adminPattern, `$1$2${enabled}`)

  const configPath = getConfigPath(appDir)
  writeFileSync(configPath, content, 'utf-8')
}

/**
 * Set locales array
 */
export function writeLocales(
  appDir: string | undefined,
  locales: Array<{ code: string; iso: string; name: string }>,
  defaultLocale: string
): void {
  let content = readConfigRaw(appDir)

  // Generate new locales array
  const localesStr = locales
    .map(l => `    { code: '${l.code}', iso: '${l.iso}', name: '${l.name}' }`)
    .join(',\n')

  // Replace locales array
  const localesPattern = /locales:\s*\[[\s\S]*?\]/
  content = content.replace(localesPattern, `locales: [\n${localesStr}\n  ]`)

  // Replace defaultLocale
  content = replaceString(content, 'defaultLocale', defaultLocale)

  const configPath = getConfigPath(appDir)
  writeFileSync(configPath, content, 'utf-8')
}

/**
 * Set module enabled state
 */
export function writeModuleEnabled(appDir: string | undefined, moduleId: string, enabled: boolean): void {
  let content = readConfigRaw(appDir)

  // Find the module section and set enabled
  // Pattern: moduleId: { ... enabled: true/false
  const modulePattern = new RegExp(`(${moduleId}:\\s*\\{[^}]*)(enabled:\\s*)(true|false)`, 's')
  content = content.replace(modulePattern, `$1$2${enabled}`)

  const configPath = getConfigPath(appDir)
  writeFileSync(configPath, content, 'utf-8')
}

/**
 * Set multiple modules at once
 */
export function writeModules(appDir: string | undefined, enabledModules: string[]): void {
  const allModules = [
    'portfolio', 'pricing', 'contact', 'blog', 'team',
    'testimonials', 'features', 'clients', 'faq'
  ]

  for (const moduleId of allModules) {
    writeModuleEnabled(appDir, moduleId, enabledModules.includes(moduleId))
  }
}

/**
 * Set feature flags
 */
export function writeFeatures(
  appDir: string | undefined,
  features: Partial<{
    multiLangs: boolean
    doubleTheme: boolean
    onepager: boolean
    pwa: boolean
  }>
): void {
  let content = readConfigRaw(appDir)

  if (features.multiLangs !== undefined) {
    content = replaceBoolean(content, 'multiLangs', features.multiLangs)
  }
  if (features.doubleTheme !== undefined) {
    content = replaceBoolean(content, 'doubleTheme', features.doubleTheme)
  }
  if (features.onepager !== undefined) {
    content = replaceBoolean(content, 'onepager', features.onepager)
  }
  if (features.pwa !== undefined) {
    content = replaceBoolean(content, 'pwa', features.pwa)
  }

  const configPath = getConfigPath(appDir)
  writeFileSync(configPath, content, 'utf-8')
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN WRITER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply full setup configuration
 * Used by wizard to save all selections at once
 */
export function applySetupConfig(appDir: string | undefined, config: SetupConfig): void {
  // Order matters - some writes depend on others
  writePmMode(appDir, config.pmMode)

  if (config.projectType) {
    writeProjectType(appDir, config.projectType)
  }

  if (config.adminEnabled !== undefined) {
    writeAdminEnabled(appDir, config.adminEnabled)
  }

  if (config.locales && config.defaultLocale) {
    writeLocales(appDir, config.locales, config.defaultLocale)
  }

  if (config.modules) {
    writeModules(appDir, config.modules)
  }

  if (config.features) {
    writeFeatures(appDir, config.features)
  }
}

/**
 * Reset config to unconfigured state
 * Preserves existing values but sets pmMode to 'unconfigured'
 */
export function resetConfig(appDir?: string): void {
  writePmMode(appDir, 'unconfigured')
}

/**
 * Quick setup for DEVELOP mode
 * Enables showcase features
 */
export function setupDevelopMode(appDir?: string): void {
  applySetupConfig(appDir, {
    pmMode: 'develop',
    projectType: 'website',
    adminEnabled: true,
    modules: ['portfolio', 'blog', 'team', 'testimonials', 'features', 'clients', 'faq', 'pricing', 'contact'],
    features: {
      multiLangs: true,
      doubleTheme: true,
      onepager: false,
      pwa: false
    }
  })
}

/**
 * Quick setup for BUILD mode with minimal config
 */
export function setupBuildMode(appDir: string | undefined, type: ProjectType): void {
  applySetupConfig(appDir, {
    pmMode: 'build',
    projectType: type,
    adminEnabled: type === 'app',
    modules: type === 'website' ? ['contact'] : [],
    features: {
      multiLangs: false,
      doubleTheme: true,
      onepager: false,
      pwa: false
    }
  })
}
