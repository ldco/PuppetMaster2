/**
 * Database Seed Script
 *
 * Creates initial admin user, default settings, and translations.
 * Run with: npm run db:seed
 *
 * IMPORTANT: Settings are defined in puppet-master.config.ts
 * IMPORTANT: Translations are stored in database:
 *            - System translations: seeded from i18n/system-seed.json, editable by master
 *            - Content translations: seeded from i18n/content.ts, editable by admin+
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { scryptSync, randomBytes } from 'crypto'
import * as schema from './schema'
import { mkdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { getContentSeedData } from '../../i18n/content'
import config from '../../app/puppet-master.config'

// Load system translations from JSON seed file
function getSystemSeedData(): Array<{ locale: string; key: string; value: string }> {
  const seedPath = join(process.cwd(), 'i18n/system-seed.json')
  try {
    if (existsSync(seedPath)) {
      const data = readFileSync(seedPath, 'utf-8')
      return JSON.parse(data)
    }
    console.warn('   ⚠️  system-seed.json not found at:', seedPath)
    return []
  } catch (e) {
    console.warn('   ⚠️  Failed to load system-seed.json:', e)
    return []
  }
}

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
    db.insert(schema.users)
      .values({
        email: 'master@example.com',
        passwordHash: hashPassword('master123'),
        name: 'Developer',
        role: 'master'
      })
      .run()
    console.log('   ✓ master@example.com / master123 (Master - full access)')

    // Admin user (client)
    db.insert(schema.users)
      .values({
        email: 'admin@example.com',
        passwordHash: hashPassword('admin123'),
        name: 'Client Owner',
        role: 'admin'
      })
      .run()
    console.log('   ✓ admin@example.com / admin123 (Admin - client access)')

    // Editor users (client employees)
    db.insert(schema.users)
      .values({
        email: 'editor@example.com',
        passwordHash: hashPassword('editor123'),
        name: 'Content Editor',
        role: 'editor'
      })
      .run()
    console.log('   ✓ editor@example.com / editor123 (Editor - content only)')

    db.insert(schema.users)
      .values({
        email: 'john@example.com',
        passwordHash: hashPassword('john123'),
        name: 'John Doe',
        role: 'editor'
      })
      .run()
    console.log('   ✓ john@example.com / john123 (Editor - content only)')

    console.log('')
  } else {
    console.log(`👤 ${existingUsers.length} users exist, skipping user creation.\n`)
  }

  // Create settings from config schema - ONLY if they don't exist
  // Uses raw SQL with INSERT OR IGNORE to preserve existing values
  console.log('⚙️  Syncing settings from config schema...')

  // Example default values for ALL settings
  const defaultValues: Record<string, string> = {
    // Contact Info
    'contact.email': 'hello@example.com',
    'contact.phone': '+1 (555) 123-4567',
    'contact.location': '123 Main Street, New York, NY 10001',

    // Social - Messaging
    'social.telegram': 'https://t.me/example',
    'social.whatsapp': 'https://wa.me/15551234567',
    'social.viber': 'viber://chat?number=15551234567',
    'social.discord': 'https://discord.gg/example',
    'social.max': '',

    // Social - Networks
    'social.instagram': 'https://instagram.com/example',
    'social.facebook': 'https://facebook.com/example',
    'social.twitter': 'https://x.com/example',
    'social.threads': 'https://threads.net/@example',
    'social.tiktok': 'https://tiktok.com/@example',
    'social.pinterest': 'https://pinterest.com/example',
    'social.vk': 'https://vk.com/example',

    // Social - Video
    'social.youtube': 'https://youtube.com/@example',
    'social.twitch': 'https://twitch.tv/example',

    // Social - Professional
    'social.linkedin': 'https://linkedin.com/company/example',
    'social.medium': 'https://medium.com/@example',

    // Social - Dev/Design
    'social.github': 'https://github.com/example',
    'social.gitlab': 'https://gitlab.com/example',
    'social.dribbble': 'https://dribbble.com/example',
    'social.behance': 'https://behance.net/example',

    // Legal
    'legal.companyName': 'Example Company LLC',
    'legal.inn': '1234567890',
    'legal.ogrn': '1234567890123',
    'legal.address': '123 Main Street, Suite 100, New York, NY 10001',
    'legal.email': 'legal@example.com',

    // Footer (ctaText is in translations as cta.footerButton)
    'footer.ctaUrl': '#contact',
    'footer.privacyUrl': '',
    'footer.termsUrl': '',

    // SEO
    'seo.title': 'Puppet Master - Modern Web Framework',
    'seo.description':
      'A production-ready Nuxt 3 framework for building client websites with admin panel.',
    'seo.keywords': 'nuxt, vue, web development, framework, cms',

    // Analytics (leave empty - user needs to add their own IDs)
    'analytics.googleId': '',
    'analytics.yandexId': '',
    'analytics.facebookPixel': '',

    // Verification (leave empty - user needs to add their own codes)
    'verification.google': '',
    'verification.yandex': ''
  }

  let settingsAdded = 0
  for (const setting of config.settings) {
    const defaultValue = defaultValues[setting.key] ?? ''
    const result = sqlite
      .prepare(
        `
      INSERT OR IGNORE INTO settings (key, value, type, "group")
      VALUES (?, ?, ?, ?)
    `
      )
      .run(setting.key, defaultValue, setting.type, setting.group)

    if (result.changes > 0) {
      console.log(
        `   + ${setting.key}${defaultValue ? ` = "${defaultValue.substring(0, 40)}${defaultValue.length > 40 ? '...' : ''}"` : ' (empty)'}`
      )
      settingsAdded++
    }
  }
  console.log(`   ${settingsAdded} new settings added, existing values preserved.\n`)

  // Seed all translations
  // Uses raw SQL with INSERT OR IGNORE to preserve existing values
  console.log('🌍 Syncing translations...')

  const systemTranslations = getSystemSeedData()
  const contentTranslations = getContentSeedData()
  let systemAdded = 0
  let contentAdded = 0
  const now = Date.now()

  // Seed system translations (from JSON)
  console.log('   📌 System translations (master-only)...')
  for (const t of systemTranslations) {
    const result = sqlite
      .prepare(
        `
      INSERT OR IGNORE INTO translations (locale, key, value, updated_at)
      VALUES (?, ?, ?, ?)
    `
      )
      .run(t.locale, t.key, t.value, now)

    if (result.changes > 0) {
      systemAdded++
    }
  }
  console.log(`      ${systemAdded} new, ${systemTranslations.length - systemAdded} preserved`)

  // Seed content translations
  console.log('   📝 Content translations (admin-editable)...')
  for (const t of contentTranslations) {
    const result = sqlite
      .prepare(
        `
      INSERT OR IGNORE INTO translations (locale, key, value, updated_at)
      VALUES (?, ?, ?, ?)
    `
      )
      .run(t.locale, t.key, t.value, now)

    if (result.changes > 0) {
      contentAdded++
    }
  }
  console.log(`      ${contentAdded} new, ${contentTranslations.length - contentAdded} preserved`)

  // Seed default portfolio items - ONLY if none exist
  console.log('\n📁 Checking portfolio items...')
  const existingPortfolio = db.select().from(schema.portfolioItems).all()

  if (existingPortfolio.length === 0) {
    console.log('   Creating default portfolio items...')

    const portfolioItems = [
      {
        slug: 'brand-identity-redesign',
        title: 'Brand Identity Redesign',
        description:
          'Complete visual identity overhaul for a tech startup, including logo, color palette, and brand guidelines.',
        category: 'Branding',
        tags: JSON.stringify(['branding', 'logo', 'identity']),
        order: 3,
        published: true,
        publishedAt: new Date()
      },
      {
        slug: 'e-commerce-platform',
        title: 'E-Commerce Platform',
        description:
          'Full-stack online store with custom checkout, inventory management, and analytics dashboard.',
        category: 'Web Development',
        tags: JSON.stringify(['web', 'ecommerce', 'fullstack']),
        order: 2,
        published: true,
        publishedAt: new Date()
      },
      {
        slug: 'mobile-fitness-app',
        title: 'Mobile Fitness App',
        description:
          'Cross-platform fitness tracking application with workout plans, progress tracking, and social features.',
        category: 'Mobile',
        tags: JSON.stringify(['mobile', 'app', 'fitness']),
        order: 1,
        published: true,
        publishedAt: new Date()
      },
      {
        slug: 'corporate-website',
        title: 'Corporate Website',
        description:
          'Modern responsive website for a financial services company with CMS integration.',
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

seed().catch(error => {
  console.error('❌ Seed failed:', error)
  sqlite.close()
  process.exit(1)
})
