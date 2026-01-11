#!/usr/bin/env npx tsx
/**
 * Puppet Master CLI Setup
 *
 * Interactive command-line setup wizard.
 * Alternative to browser wizard for terminal-only environments.
 *
 * Usage:
 *   npx tsx scripts/setup-cli.ts
 *   # or
 *   npm run setup:cli
 */

import * as readline from 'readline'
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

const AVAILABLE_MODULES = [
  { id: 'blog', name: 'Blog' },
  { id: 'portfolio', name: 'Portfolio' },
  { id: 'team', name: 'Team' },
  { id: 'testimonials', name: 'Testimonials' },
  { id: 'faq', name: 'FAQ' },
  { id: 'pricing', name: 'Pricing' },
  { id: 'clients', name: 'Clients' },
  { id: 'features', name: 'Features' },
  { id: 'contact', name: 'Contact' }
]

const AVAILABLE_LOCALES = [
  { code: 'en', iso: 'en-US', name: 'English' },
  { code: 'ru', iso: 'ru-RU', name: 'Russian' },
  { code: 'he', iso: 'he-IL', name: 'Hebrew' },
  { code: 'es', iso: 'es-ES', name: 'Spanish' },
  { code: 'fr', iso: 'fr-FR', name: 'French' },
  { code: 'de', iso: 'de-DE', name: 'German' }
]

// ═══════════════════════════════════════════════════════════════════════════════
// READLINE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()))
  })
}

async function askChoice(question: string, options: string[]): Promise<number> {
  console.log(`\n${question}`)
  options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`))

  while (true) {
    const answer = await ask('Enter number: ')
    const num = parseInt(answer)
    if (num >= 1 && num <= options.length) {
      return num - 1
    }
    console.log('Invalid choice, please try again.')
  }
}

async function askYesNo(question: string, defaultYes = true): Promise<boolean> {
  const hint = defaultYes ? '[Y/n]' : '[y/N]'
  const answer = await ask(`${question} ${hint} `)

  if (!answer) return defaultYes
  return answer.toLowerCase().startsWith('y')
}

async function askMultiSelect(question: string, options: Array<{ id: string; name: string }>): Promise<string[]> {
  console.log(`\n${question}`)
  console.log('Enter numbers separated by commas (e.g., 1,3,5) or "all" for all:')
  options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt.name}`))

  const answer = await ask('Selection: ')

  if (answer.toLowerCase() === 'all') {
    return options.map(o => o.id)
  }

  if (!answer) return []

  const nums = answer.split(',').map(s => parseInt(s.trim()))
  return nums
    .filter(n => n >= 1 && n <= options.length)
    .map(n => options[n - 1].id)
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
  const allModules = AVAILABLE_MODULES.map(m => m.id)
  for (const moduleId of allModules) {
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
// MAIN WIZARD
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         🎭 PUPPET MASTER CLI SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

  const config: SetupConfig = {
    pmMode: 'build',
    projectType: 'website',
    adminEnabled: true,
    modules: ['contact'],
    features: {
      multiLangs: false,
      doubleTheme: true,
      onepager: false,
      pwa: false
    },
    locales: [{ code: 'en', iso: 'en-US', name: 'English' }],
    defaultLocale: 'en'
  }

  // Step 1: Mode
  const modeChoice = await askChoice('Choose your mode:', [
    'BUILD - Create a client project',
    'DEVELOP - Work on the PM framework'
  ])
  config.pmMode = modeChoice === 0 ? 'build' : 'develop'

  if (config.pmMode === 'develop') {
    // DEVELOP mode - enable everything
    config.modules = AVAILABLE_MODULES.map(m => m.id)
    config.features.multiLangs = true
    config.features.doubleTheme = true
  } else {
    // BUILD mode - ask for details

    // Step 2: Project Type
    const typeChoice = await askChoice('What are you building?', [
      'Website - Marketing site, landing pages',
      'App - Dashboard, user features'
    ])
    config.projectType = typeChoice === 0 ? 'website' : 'app'

    // Step 3: Admin Panel
    config.adminEnabled = await askYesNo('\nEnable admin panel?', true)

    // Step 4: Modules
    config.modules = await askMultiSelect('Select modules to enable:', AVAILABLE_MODULES)

    // Step 5: Languages
    console.log('\n--- Languages ---')
    const selectedLocales = await askMultiSelect('Select languages:', AVAILABLE_LOCALES)
    config.locales = AVAILABLE_LOCALES.filter(l => selectedLocales.includes(l.code))

    if (config.locales.length === 0) {
      config.locales = [AVAILABLE_LOCALES[0]] // Default to English
    }

    config.features.multiLangs = config.locales.length > 1

    if (config.locales.length > 1) {
      const defaultChoice = await askChoice(
        'Select default language:',
        config.locales.map(l => l.name)
      )
      config.defaultLocale = config.locales[defaultChoice].code
    } else {
      config.defaultLocale = config.locales[0].code
    }

    // Step 6: Features
    console.log('\n--- Additional Features ---')
    config.features.doubleTheme = await askYesNo('Enable dark/light mode toggle?', true)
    config.features.onepager = await askYesNo('Use one-page layout (scroll navigation)?', false)
    config.features.pwa = await askYesNo('Enable Progressive Web App (PWA)?', false)
  }

  // Review
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                              📋 REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Mode:         ${config.pmMode.toUpperCase()}
  Type:         ${config.projectType === 'website' ? 'Website' : 'App'}
  Admin:        ${config.adminEnabled ? 'Enabled' : 'Disabled'}
  Modules:      ${config.modules.length > 0 ? config.modules.join(', ') : 'None'}
  Languages:    ${config.locales.map(l => l.name).join(', ')}
  Features:     ${[
    config.features.doubleTheme && 'Dark Mode',
    config.features.onepager && 'One-page',
    config.features.pwa && 'PWA'
  ].filter(Boolean).join(', ') || 'Default'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

  const confirm = await askYesNo('Apply this configuration?', true)

  if (!confirm) {
    console.log('\nSetup cancelled.')
    rl.close()
    process.exit(0)
  }

  // Apply configuration
  console.log('\n⏳ Applying configuration...')

  try {
    writeConfig(config)
    console.log('✅ Configuration saved!')

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         ✅ SETUP COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Next steps:
    1. npm run db:push    - Apply database migrations
    2. npm run db:seed    - Seed sample data (optional)
    3. npm run dev        - Start development server

  Or run:
    npm run dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
  } catch (error) {
    console.error('❌ Failed to save configuration:', error)
    process.exit(1)
  }

  rl.close()
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
