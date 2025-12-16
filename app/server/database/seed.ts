/**
 * Database Seed Script
 *
 * Creates initial admin user, default settings, and translations.
 * Run with: npm run db:seed
 *
 * IMPORTANT: Settings are defined in puppet-master.config.ts
 * IMPORTANT: All translations come from DB only - no fallbacks!
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { scryptSync, randomBytes } from 'crypto'
import * as schema from './schema'
import { mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'
import { getSeedData } from '../../i18n/fallbacks'
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

  // Check if admin user already exists
  const existingAdmin = db.select().from(schema.users).get()
  if (existingAdmin) {
    console.log('⚠️  Database already seeded. Skipping.\n')
    sqlite.close()
    return
  }

  // Create admin user
  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin123' // Change in production!

  console.log('👤 Creating admin user...')
  db.insert(schema.users).values({
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    name: 'Admin',
    role: 'admin'
  }).run()
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}\n`)

  // Create settings from config schema (empty values - to be filled via Admin Panel)
  console.log('⚙️  Creating settings from config schema...')
  for (const setting of config.settings) {
    db.insert(schema.settings).values({
      key: setting.key,
      value: '',  // Empty - values are entered via Admin Panel
      type: setting.type,
      group: setting.group
    }).run()
    console.log(`   ${setting.key} (${setting.type}) → Admin Panel`)
  }

  // Seed translations (ALL website text comes from DB!)
  console.log('\n🌍 Seeding translations...')
  const translations = getSeedData()
  let translationCount = 0

  for (const t of translations) {
    db.insert(schema.translations).values({
      locale: t.locale,
      key: t.key,
      value: t.value
    }).run()
    translationCount++
  }
  console.log(`   Added ${translationCount} translations`)

  // Count per locale
  const locales = [...new Set(translations.map(t => t.locale))]
  for (const locale of locales) {
    const count = translations.filter(t => t.locale === locale).length
    console.log(`   ${locale}: ${count} keys`)
  }

  console.log('\n✅ Database seeded successfully!\n')
  sqlite.close()
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  sqlite.close()
  process.exit(1)
})

