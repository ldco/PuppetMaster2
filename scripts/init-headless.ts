#!/usr/bin/env npx tsx
/**
 * Puppet Master Headless Init
 *
 * Non-interactive init for CI/CD pipelines and automated deployments.
 * Accepts configuration via command-line arguments or environment variables.
 *
 * Usage:
 *   npm run init:headless -- --mode=build --type=website
 *   npm run init:headless -- --mode=develop
 *
 * Environment variables (alternative to CLI args):
 *   PM_MODE=build|develop
 *   PM_TYPE=website|app
 *   PM_ADMIN=true|false
 *   PM_MODULES=blog,portfolio,contact
 *   PM_LOCALES=en,ru,he
 *   PM_DEFAULT_LOCALE=en
 *   PM_DARK_MODE=true|false
 *   PM_ONEPAGER=true|false
 *   PM_PWA=true|false
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type PmMode = 'build' | 'develop'
type ProjectType = 'website' | 'app'

interface SetupConfig {
  pmMode: PmMode
  projectType: ProjectType
  adminEnabled: boolean
  modules: string[]
  features: {
    multiLangs: boolean
    doubleTheme: boolean
    onepager: boolean
    pwa: boolean
  }
  locales: Array<{ code: string; iso: string; name: string }>
  defaultLocale: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const LOCALE_MAP: Record<string, { code: string; iso: string; name: string }> = {
  en: { code: 'en', iso: 'en-US', name: 'English' },
  ru: { code: 'ru', iso: 'ru-RU', name: 'Russian' },
  he: { code: 'he', iso: 'he-IL', name: 'Hebrew' },
  es: { code: 'es', iso: 'es-ES', name: 'Spanish' },
  fr: { code: 'fr', iso: 'fr-FR', name: 'French' },
  de: { code: 'de', iso: 'de-DE', name: 'German' },
  zh: { code: 'zh', iso: 'zh-CN', name: 'Chinese' },
  ja: { code: 'ja', iso: 'ja-JP', name: 'Japanese' }
}

const ALL_MODULES = ['blog', 'portfolio', 'team', 'testimonials', 'faq', 'pricing', 'clients', 'features', 'contact']

// ═══════════════════════════════════════════════════════════════════════════════
// CLI ARGUMENT PARSING
// ═══════════════════════════════════════════════════════════════════════════════

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {}

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      if (key && value !== undefined) {
        args[key] = value
      } else if (key) {
        args[key] = 'true'
      }
    }
  }

  return args
}

function getConfig(): SetupConfig {
  const args = parseArgs()

  // Mode (required)
  const mode = args.mode || process.env.PM_MODE || ''
  if (!['build', 'develop'].includes(mode)) {
    console.error('Error: --mode must be "build" or "develop"')
    console.error('Usage: npx tsx scripts/setup-headless.ts --mode=build --type=website')
    process.exit(1)
  }

  // Project type (required for build mode)
  const projectType = args.type || process.env.PM_TYPE || 'website'
  if (mode === 'build' && !['website', 'app'].includes(projectType)) {
    console.error('Error: --type must be "website" or "app" for build mode')
    process.exit(1)
  }

  // Admin (default: true for app, true for website)
  const adminStr = args.admin || process.env.PM_ADMIN || 'true'
  const adminEnabled = adminStr.toLowerCase() === 'true'

  // Modules
  const modulesStr = args.modules || process.env.PM_MODULES || ''
  let modules: string[]
  if (mode === 'develop') {
    modules = ALL_MODULES
  } else if (modulesStr === 'all') {
    modules = ALL_MODULES
  } else if (modulesStr) {
    modules = modulesStr.split(',').filter(m => ALL_MODULES.includes(m.trim()))
  } else {
    modules = ['contact'] // Default
  }

  // Locales
  const localesStr = args.locales || process.env.PM_LOCALES || 'en'
  const localeCodes = localesStr.split(',').map(s => s.trim()).filter(Boolean)
  const locales = localeCodes
    .filter(code => LOCALE_MAP[code])
    .map(code => LOCALE_MAP[code])
  if (locales.length === 0) {
    locales.push(LOCALE_MAP.en)
  }

  // Default locale
  const defaultLocale = args['default-locale'] || process.env.PM_DEFAULT_LOCALE || locales[0].code

  // Features
  const darkMode = (args['dark-mode'] || process.env.PM_DARK_MODE || 'true').toLowerCase() === 'true'
  const onepager = (args.onepager || process.env.PM_ONEPAGER || 'false').toLowerCase() === 'true'
  const pwa = (args.pwa || process.env.PM_PWA || 'false').toLowerCase() === 'true'

  // DEVELOP mode overrides
  if (mode === 'develop') {
    return {
      pmMode: 'develop',
      projectType: 'website',
      adminEnabled: true,
      modules: ALL_MODULES,
      features: {
        multiLangs: true,
        doubleTheme: true,
        onepager: false,
        pwa: false
      },
      locales: [LOCALE_MAP.en, LOCALE_MAP.ru, LOCALE_MAP.he],
      defaultLocale: 'en'
    }
  }

  return {
    pmMode: mode as PmMode,
    projectType: projectType as ProjectType,
    adminEnabled,
    modules,
    features: {
      multiLangs: locales.length > 1,
      doubleTheme: darkMode,
      onepager,
      pwa
    },
    locales,
    defaultLocale
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG WRITER
// ═══════════════════════════════════════════════════════════════════════════════

function writeConfig(config: SetupConfig): void {
  const configPath = resolve(process.cwd(), 'app', 'puppet-master.config.ts')

  if (!existsSync(configPath)) {
    throw new Error('Config file not found: ' + configPath)
  }

  let content = readFileSync(configPath, 'utf-8')

  // Helper functions
  const replaceBoolean = (str: string, key: string, value: boolean): string => {
    const pattern = new RegExp(`(${key}:\\s*)(true|false)`, 'g')
    return str.replace(pattern, `$1${value}`)
  }

  const replaceString = (str: string, key: string, value: string): string => {
    const pattern = new RegExp(`(${key}:\\s*)['"][^'"]*['"]`, 'g')
    return str.replace(pattern, `$1'${value}'`)
  }

  // Update pmMode
  content = content.replace(
    /pmMode:\s*['"]?\w+['"]?\s*as\s*['"][^'"]*['"]\s*\|\s*['"][^'"]*['"]\s*\|\s*['"][^'"]*['"]/,
    `pmMode: '${config.pmMode}' as 'unconfigured' | 'build' | 'develop'`
  )

  // Update entities
  content = replaceBoolean(content, 'website', config.projectType === 'website')
  content = replaceBoolean(content, 'app', config.projectType === 'app')

  // Update admin.enabled
  const adminPattern = /(admin:\s*\{[\s\S]*?)(enabled:\s*)(true|false)/
  content = content.replace(adminPattern, `$1$2${config.adminEnabled}`)

  // Update locales
  const localesStr = config.locales
    .map(l => `    { code: '${l.code}', iso: '${l.iso}', name: '${l.name}' }`)
    .join(',\n')
  content = content.replace(/locales:\s*\[[\s\S]*?\]/, `locales: [\n${localesStr}\n  ]`)

  // Update defaultLocale
  content = replaceString(content, 'defaultLocale', config.defaultLocale)

  // Update modules
  for (const moduleId of ALL_MODULES) {
    const enabled = config.modules.includes(moduleId)
    const modulePattern = new RegExp(`(${moduleId}:\\s*\\{[^}]*)(enabled:\\s*)(true|false)`, 's')
    content = content.replace(modulePattern, `$1$2${enabled}`)
  }

  // Update features
  content = replaceBoolean(content, 'multiLangs', config.features.multiLangs)
  content = replaceBoolean(content, 'doubleTheme', config.features.doubleTheme)
  content = replaceBoolean(content, 'onepager', config.features.onepager)
  content = replaceBoolean(content, 'pwa', config.features.pwa)

  writeFileSync(configPath, content, 'utf-8')
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  // Check for help
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Puppet Master Headless Setup

Usage:
  npx tsx scripts/setup-headless.ts [options]

Options:
  --mode=<build|develop>     Required. Project mode
  --type=<website|app>       Project type (build mode only, default: website)
  --admin=<true|false>       Enable admin panel (default: true)
  --modules=<list>           Comma-separated modules (default: contact)
                             Options: blog,portfolio,team,testimonials,faq,
                                      pricing,clients,features,contact
                             Use "all" for all modules
  --locales=<list>           Comma-separated locale codes (default: en)
                             Options: en,ru,he,es,fr,de,zh,ja
  --default-locale=<code>    Default locale (default: first in list)
  --dark-mode=<true|false>   Enable dark mode toggle (default: true)
  --onepager=<true|false>    One-page layout (default: false)
  --pwa=<true|false>         Progressive Web App (default: false)

Environment Variables:
  PM_MODE, PM_TYPE, PM_ADMIN, PM_MODULES, PM_LOCALES,
  PM_DEFAULT_LOCALE, PM_DARK_MODE, PM_ONEPAGER, PM_PWA

Examples:
  # Quick build mode setup
  npx tsx scripts/setup-headless.ts --mode=build --type=website

  # Full featured website
  npx tsx scripts/setup-headless.ts --mode=build --type=website \\
    --modules=blog,portfolio,contact --locales=en,es --dark-mode=true

  # App with admin
  npx tsx scripts/setup-headless.ts --mode=build --type=app --admin=true

  # Framework development mode
  npx tsx scripts/setup-headless.ts --mode=develop
`)
    process.exit(0)
  }

  console.log('🎭 Puppet Master Headless Setup')
  console.log('━'.repeat(50))

  const config = getConfig()

  console.log(`\nConfiguration:`)
  console.log(`  Mode:      ${config.pmMode.toUpperCase()}`)
  console.log(`  Type:      ${config.projectType}`)
  console.log(`  Admin:     ${config.adminEnabled}`)
  console.log(`  Modules:   ${config.modules.join(', ') || 'none'}`)
  console.log(`  Locales:   ${config.locales.map(l => l.code).join(', ')}`)
  console.log(`  Features:  ${[
    config.features.doubleTheme && 'dark-mode',
    config.features.onepager && 'onepager',
    config.features.pwa && 'pwa'
  ].filter(Boolean).join(', ') || 'default'}`)

  console.log(`\n⏳ Applying configuration...`)

  try {
    writeConfig(config)
    console.log('✅ Configuration saved!')
    console.log(`\nNext steps:`)
    console.log(`  npm run db:push    # Apply database migrations`)
    console.log(`  npm run db:seed    # Seed sample data (optional)`)
    console.log(`  npm run dev        # Start development server`)
  } catch (error) {
    console.error('❌ Failed:', error)
    process.exit(1)
  }
}

main()
