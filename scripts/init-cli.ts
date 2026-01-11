#!/usr/bin/env npx tsx
/**
 * Puppet Master Init
 *
 * Interactive mode (default):
 *   npm run init
 *
 * Headless mode (for CI/CD):
 *   npm run init -- --headless --mode=build --type=website
 *   npm run init -- --headless --mode=develop
 */

import * as readline from 'readline'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { execSync, spawn } from 'child_process'

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
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {}
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      args[key] = value ?? 'true'
    }
  }
  return args
}

function readCurrentMode(): string {
  const configPath = resolve(process.cwd(), 'app', 'puppet-master.config.ts')
  if (!existsSync(configPath)) return 'unconfigured'
  const content = readFileSync(configPath, 'utf-8')
  const match = content.match(/pmMode:\s*['"](\w+)['"]/)
  return match ? match[1] : 'unconfigured'
}

function setConfigMode(mode: 'build' | 'develop' | 'unconfigured'): void {
  const configPath = resolve(process.cwd(), 'app', 'puppet-master.config.ts')
  if (!existsSync(configPath)) throw new Error('Config file not found')

  let content = readFileSync(configPath, 'utf-8')
  content = content.replace(
    /pmMode:\s*['"]?\w+['"]?\s*as\s*['"][^'"]*['"]\s*\|\s*['"][^'"]*['"]\s*\|\s*['"][^'"]*['"]/,
    `pmMode: '${mode}' as 'unconfigured' | 'build' | 'develop'`
  )

  if (mode === 'develop') {
    for (const mod of ALL_MODULES) {
      content = content.replace(
        new RegExp(`(${mod}:\\s*\\{[^}]*)(enabled:\\s*)(true|false)`, 's'),
        '$1$2true'
      )
    }
    content = content.replace(/(multiLangs:\s*)(true|false)/g, '$1true')
    content = content.replace(/(doubleTheme:\s*)(true|false)/g, '$1true')
  }

  writeFileSync(configPath, content, 'utf-8')
}

function writeFullConfig(config: {
  pmMode: string
  projectType: string
  adminEnabled: boolean
  modules: string[]
  features: { multiLangs: boolean; doubleTheme: boolean; onepager: boolean; pwa: boolean }
  locales: Array<{ code: string; iso: string; name: string }>
  defaultLocale: string
}): void {
  const configPath = resolve(process.cwd(), 'app', 'puppet-master.config.ts')
  if (!existsSync(configPath)) throw new Error('Config file not found')

  let content = readFileSync(configPath, 'utf-8')

  const replaceBoolean = (str: string, key: string, value: boolean): string => {
    return str.replace(new RegExp(`(${key}:\\s*)(true|false)`, 'g'), `$1${value}`)
  }

  // pmMode
  content = content.replace(
    /pmMode:\s*['"]?\w+['"]?\s*as\s*['"][^'"]*['"]\s*\|\s*['"][^'"]*['"]\s*\|\s*['"][^'"]*['"]/,
    `pmMode: '${config.pmMode}' as 'unconfigured' | 'build' | 'develop'`
  )

  // entities
  content = replaceBoolean(content, 'website', config.projectType === 'website')
  content = replaceBoolean(content, 'app', config.projectType === 'app')

  // admin
  content = content.replace(/(admin:\s*\{[\s\S]*?)(enabled:\s*)(true|false)/, `$1$2${config.adminEnabled}`)

  // locales
  const localesStr = config.locales.map(l => `    { code: '${l.code}', iso: '${l.iso}', name: '${l.name}' }`).join(',\n')
  content = content.replace(/locales:\s*\[[\s\S]*?\]/, `locales: [\n${localesStr}\n  ]`)
  content = content.replace(/(defaultLocale:\s*)['"][^'"]*['"]/, `$1'${config.defaultLocale}'`)

  // modules
  for (const mod of ALL_MODULES) {
    const enabled = config.modules.includes(mod)
    content = content.replace(new RegExp(`(${mod}:\\s*\\{[^}]*)(enabled:\\s*)(true|false)`, 's'), `$1$2${enabled}`)
  }

  // features
  content = replaceBoolean(content, 'multiLangs', config.features.multiLangs)
  content = replaceBoolean(content, 'doubleTheme', config.features.doubleTheme)
  content = replaceBoolean(content, 'onepager', config.features.onepager)
  content = replaceBoolean(content, 'pwa', config.features.pwa)

  writeFileSync(configPath, content, 'utf-8')
}

function runCommand(cmd: string, desc: string): void {
  console.log(`\n${desc}...`)
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd() })
}

function startDevServer(): void {
  console.log('\nStarting dev server...\n')
  spawn('npm', ['run', 'dev'], { cwd: process.cwd(), stdio: 'inherit', shell: true })
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEADLESS MODE
// ═══════════════════════════════════════════════════════════════════════════════

function runHeadless(args: Record<string, string>) {
  // Help
  if (args.help || args.h) {
    console.log(`
Puppet Master Init (Headless)

Usage:
  npm run init -- --headless --mode=build --type=website [options]

Options:
  --mode=<build|develop>     Required. Project mode
  --type=<website|app>       Project type (default: website)
  --admin=<true|false>       Enable admin panel (default: true)
  --modules=<list>           Comma-separated: blog,portfolio,team,testimonials,
                             faq,pricing,clients,features,contact (or "all")
  --locales=<list>           Comma-separated: en,ru,he,es,fr,de,zh,ja
  --default-locale=<code>    Default locale (default: first in list)
  --dark-mode=<true|false>   Dark mode toggle (default: true)
  --onepager=<true|false>    One-page layout (default: false)
  --pwa=<true|false>         Progressive Web App (default: false)

Examples:
  npm run init -- --headless --mode=build --type=website
  npm run init -- --headless --mode=build --modules=blog,contact --locales=en,es
  npm run init -- --headless --mode=develop
`)
    process.exit(0)
  }

  const mode = args.mode || process.env.PM_MODE || ''
  if (!['build', 'develop'].includes(mode)) {
    console.error('Error: --mode must be "build" or "develop"')
    process.exit(1)
  }

  console.log('🎭 Puppet Master Init (Headless)')
  console.log('━'.repeat(50))

  if (mode === 'develop') {
    const config = {
      pmMode: 'develop',
      projectType: 'website',
      adminEnabled: true,
      modules: ALL_MODULES,
      features: { multiLangs: true, doubleTheme: true, onepager: false, pwa: false },
      locales: [LOCALE_MAP.en, LOCALE_MAP.ru, LOCALE_MAP.he],
      defaultLocale: 'en'
    }
    writeFullConfig(config)
    console.log('\n✅ DEVELOP mode configured')
    runCommand('npm run db:push', 'Database schema')
    runCommand('npm run db:seed', 'Seeding data')
    console.log('\n✅ Ready! Run: npm run dev')
  } else {
    const projectType = args.type || process.env.PM_TYPE || 'website'
    const adminEnabled = (args.admin || process.env.PM_ADMIN || 'true') === 'true'
    const modulesStr = args.modules || process.env.PM_MODULES || 'contact'
    const modules = modulesStr === 'all' ? ALL_MODULES : modulesStr.split(',').filter(m => ALL_MODULES.includes(m.trim()))
    const localesStr = args.locales || process.env.PM_LOCALES || 'en'
    const locales = localesStr.split(',').map(c => LOCALE_MAP[c.trim()]).filter(Boolean)
    if (locales.length === 0) locales.push(LOCALE_MAP.en)
    const defaultLocale = args['default-locale'] || process.env.PM_DEFAULT_LOCALE || locales[0].code
    const darkMode = (args['dark-mode'] || process.env.PM_DARK_MODE || 'true') === 'true'
    const onepager = (args.onepager || process.env.PM_ONEPAGER || 'false') === 'true'
    const pwa = (args.pwa || process.env.PM_PWA || 'false') === 'true'

    const config = {
      pmMode: 'build',
      projectType,
      adminEnabled,
      modules,
      features: { multiLangs: locales.length > 1, doubleTheme: darkMode, onepager, pwa },
      locales,
      defaultLocale
    }

    console.log(`\nConfiguration:`)
    console.log(`  Mode:     BUILD`)
    console.log(`  Type:     ${projectType}`)
    console.log(`  Admin:    ${adminEnabled}`)
    console.log(`  Modules:  ${modules.join(', ')}`)
    console.log(`  Locales:  ${locales.map(l => l.code).join(', ')}`)

    writeFullConfig(config)
    console.log('\n✅ Configuration saved')
    runCommand('npm run db:push', 'Database schema')
    console.log('\n✅ Ready! Run: npm run dev')
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERACTIVE MODE
// ═══════════════════════════════════════════════════════════════════════════════

async function runInteractive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const ask = (q: string): Promise<string> => new Promise(res => rl.question(q, a => res(a.trim())))

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         PUPPET MASTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

  // Check if already configured
  const currentMode = readCurrentMode()
  if (currentMode !== 'unconfigured') {
    console.log(`Already configured: ${currentMode.toUpperCase()} mode\n`)
    console.log('1. Start dev server')
    console.log('2. Reconfigure')
    const choice = await ask('\nEnter number: ')

    if (choice === '1') {
      rl.close()
      startDevServer()
      return
    }
    setConfigMode('unconfigured')
    console.log('\nReset. Continuing...\n')
  }

  // THE ONLY QUESTION: BUILD or DEVELOP?
  console.log('1. BUILD — Client project')
  console.log('2. DEVELOP — PM framework')
  const mode = await ask('\nEnter number: ')
  rl.close()

  if (mode === '2') {
    console.log('\n━━━ DEVELOP MODE ━━━\n')
    setConfigMode('develop')
    runCommand('npm run db:push', 'Database schema')
    runCommand('npm run db:seed', 'Seeding data')
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  READY — http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
    startDevServer()
  } else {
    console.log('\n━━━ BUILD MODE ━━━\n')
    setConfigMode('build')
    runCommand('npm run db:push', 'Database schema')
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Complete setup in browser: http://localhost:3000/init
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
    startDevServer()
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const args = parseArgs()

// Headless if --headless flag OR --mode is specified
if (args.headless || args.mode) {
  runHeadless(args)
} else {
  runInteractive().catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
}
