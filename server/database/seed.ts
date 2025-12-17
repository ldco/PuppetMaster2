/**
 * Database Seed Script
 *
 * Creates initial admin user, default settings, and CONTENT translations.
 * Run with: npm run db:seed
 *
 * IMPORTANT: Settings are defined in puppet-master.config.ts
 * IMPORTANT: Only CONTENT translations go to database!
 *            System translations (nav, auth, admin, etc.) come from i18n/system.ts
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { scryptSync, randomBytes } from 'crypto'
import * as schema from './schema'
import { mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'
import { getContentSeedData } from '../../i18n/content'
import config from '../../app/puppet-master.config'

const DB_PATH = process.env.DATABASE_URL || './data/sqlite.db'

// Ensure data directory exists
const dir = dirname(DB_PATH)
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true })
}

// Create database connection
const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
const db = drizzle(sqlite, { schema })

// Password hashing (same as server/utils/password.ts)
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function seed() {
  console.log('🌱 Seeding database...\n')

  // Check if users already exist
  const existingUsers = db.select().from(schema.users).all()

  if (existingUsers.length === 0) {
    console.log('👤 Creating example users...\n')

    // Master user (developer)
    db.insert(schema.users).values({
      email: 'master@example.com',
      passwordHash: hashPassword('master123'),
      name: 'Developer',
      role: 'master'
    }).run()
    console.log('   ✓ master@example.com / master123 (Master - full access)')

    // Admin user (client)
    db.insert(schema.users).values({
      email: 'admin@example.com',
      passwordHash: hashPassword('admin123'),
      name: 'Client Owner',
      role: 'admin'
    }).run()
    console.log('   ✓ admin@example.com / admin123 (Admin - client access)')

    // Editor users (client employees)
    db.insert(schema.users).values({
      email: 'editor@example.com',
      passwordHash: hashPassword('editor123'),
      name: 'Content Editor',
      role: 'editor'
    }).run()
    console.log('   ✓ editor@example.com / editor123 (Editor - content only)')

    db.insert(schema.users).values({
      email: 'john@example.com',
      passwordHash: hashPassword('john123'),
      name: 'John Doe',
      role: 'editor'
    }).run()
    console.log('   ✓ john@example.com / john123 (Editor - content only)')

    console.log('')
  } else {
    console.log(`👤 ${existingUsers.length} users exist, skipping user creation.\n`)
  }

  // Create settings from config schema - ONLY if they don't exist
  // Uses raw SQL with INSERT OR IGNORE to preserve existing values
  console.log('⚙️  Syncing settings from config schema...')
  let settingsAdded = 0
  for (const setting of config.settings) {
    const result = sqlite.prepare(`
      INSERT OR IGNORE INTO settings (key, value, type, "group")
      VALUES (?, '', ?, ?)
    `).run(setting.key, setting.type, setting.group)

    if (result.changes > 0) {
      console.log(`   + ${setting.key} (new)`)
      settingsAdded++
    }
  }
  console.log(`   ${settingsAdded} new settings added, existing values preserved.\n`)

  // Seed CONTENT translations only - system translations come from i18n/system.ts
  // Uses raw SQL with INSERT OR IGNORE to preserve existing values
  console.log('🌍 Syncing CONTENT translations (client-editable)...')
  const translations = getContentSeedData()
  let translationsAdded = 0

  const now = Date.now()
  for (const t of translations) {
    const result = sqlite.prepare(`
      INSERT OR IGNORE INTO translations (locale, key, value, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(t.locale, t.key, t.value, now)

    if (result.changes > 0) {
      translationsAdded++
    }
  }

  console.log(`   ${translationsAdded} new translations added`)
  console.log(`   ${translations.length - translationsAdded} existing translations preserved`)

  // Count per locale
  const locales = [...new Set(translations.map(t => t.locale))]
  for (const locale of locales) {
    const count = translations.filter(t => t.locale === locale).length
    console.log(`   ${locale}: ${count} keys in seed`)
  }

  // Seed default portfolio items - ONLY if none exist
  console.log('\n📁 Checking portfolio items...')
  const existingPortfolio = db.select().from(schema.portfolioItems).all()

  if (existingPortfolio.length === 0) {
    console.log('   Creating default portfolio items...')

    const portfolioItems = [
      {
        slug: 'brand-identity-redesign',
        title: 'Brand Identity Redesign',
        description: 'Complete visual identity overhaul for a tech startup, including logo, color palette, and brand guidelines.',
        category: 'Branding',
        tags: JSON.stringify(['branding', 'logo', 'identity']),
        order: 3,
        published: true,
        publishedAt: new Date()
      },
      {
        slug: 'e-commerce-platform',
        title: 'E-Commerce Platform',
        description: 'Full-stack online store with custom checkout, inventory management, and analytics dashboard.',
        category: 'Web Development',
        tags: JSON.stringify(['web', 'ecommerce', 'fullstack']),
        order: 2,
        published: true,
        publishedAt: new Date()
      },
      {
        slug: 'mobile-fitness-app',
        title: 'Mobile Fitness App',
        description: 'Cross-platform fitness tracking application with workout plans, progress tracking, and social features.',
        category: 'Mobile',
        tags: JSON.stringify(['mobile', 'app', 'fitness']),
        order: 1,
        published: true,
        publishedAt: new Date()
      },
      {
        slug: 'corporate-website',
        title: 'Corporate Website',
        description: 'Modern responsive website for a financial services company with CMS integration.',
        category: 'Web Development',
        tags: JSON.stringify(['web', 'corporate', 'cms']),
        order: 0,
        published: true,
        publishedAt: new Date()
      }
    ]

    for (const item of portfolioItems) {
      db.insert(schema.portfolioItems).values(item).run()
      console.log(`   ✓ ${item.title}`)
    }
  } else {
    console.log(`   ${existingPortfolio.length} portfolio items exist, skipping.`)
  }

  console.log('\n✅ Database sync complete! Existing values preserved.\n')
  sqlite.close()
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  sqlite.close()
  process.exit(1)
})

